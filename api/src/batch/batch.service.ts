import { Injectable, Logger } from '@nestjs/common';
import { BatchInfluxRepository, RawMetricRow } from './repositories/batch-influx.repository';
import { DailySummaryRepository, CreateSummaryDto } from './repositories/daily-summary.repository';
import { DailySummary } from './entities/summary.entity';

@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);

  constructor(
    private readonly batchInfluxRepository: BatchInfluxRepository,
    private readonly dailySummaryRepository: DailySummaryRepository,
  ) {}

  /**
   * Menjalankan pipeline ETL untuk satu hari tertentu.
   * Dipanggil oleh: BullMQ Processor (otomatis) atau Controller (manual trigger).
   */
  async runPipelineForDate(dateStr: string): Promise<{ processed: number; date: string }> {
    this.logger.log(`[Batch] Starting ETL pipeline for date: ${dateStr}`);

    // === STEP 1: EXTRACT ===
    // Ambil semua data mentah dari InfluxDB untuk hari tersebut
    const rawRows = await this.batchInfluxRepository.getRawMetricsForDate(dateStr);
    this.logger.log(`[Batch] Extracted ${rawRows.length} raw rows from InfluxDB`);

    if (rawRows.length === 0) {
      this.logger.warn(`[Batch] No data found for date: ${dateStr}`);
      return { processed: 0, date: dateStr };
    }

    // === STEP 2: TRANSFORM ===
    // Pisahkan data latency dan data isUp, lalu group per configId
    const summaries = this.transformRows(rawRows, dateStr);
    this.logger.log(`[Batch] Transformed into ${summaries.length} summary records`);

    // === STEP 3: LOAD ===
    // Simpan hasil agregasi ke PostgreSQL (upsert)
    await this.dailySummaryRepository.upsert(summaries);
    this.logger.log(`[Batch] Loaded ${summaries.length} summaries into PostgreSQL`);

    return { processed: summaries.length, date: dateStr };
  }

  /**
   * Transform: Mengagregasi data mentah per configId menjadi ringkasan harian.
   * Optimasi: Menggunakan timestamp nyata dari InfluxDB untuk menghitung downtime secara akurat.
   */
  private transformRows(rows: RawMetricRow[], date: string): CreateSummaryDto[] {
    // Group rows berdasarkan configId
    const grouped = new Map<
      string,
      {
        latencies: number[];
        isUpChecks: { time: Date; isUp: boolean }[];
        projectId: string;
        url: string;
      }
    >();

    for (const row of rows) {
      if (!grouped.has(row.configId)) {
        grouped.set(row.configId, {
          latencies: [],
          isUpChecks: [],
          projectId: row.projectId,
          url: row.url,
        });
      }

      const group = grouped.get(row.configId)!;

      if (row._field === 'latency' && typeof row._value === 'number') {
        group.latencies.push(row._value);
      } else if (row._field === 'isUp') {
        group.isUpChecks.push({
          time: new Date(row._time),
          isUp: Boolean(row._value),
        });
      }
    }

    // Hitung agregasi per configId
    const summaries: CreateSummaryDto[] = [];

    for (const [configId, data] of grouped.entries()) {
      const { latencies, isUpChecks, projectId, url } = data;

      // Urutkan check berdasarkan waktu untuk kalkulasi durasi downtime yang presisi
      isUpChecks.sort((a, b) => a.time.getTime() - b.time.getTime());

      const totalChecks = isUpChecks.length;
      const failedChecks = isUpChecks.filter((v) => !v.isUp).length;
      const uptimePercent = totalChecks > 0
        ? ((totalChecks - failedChecks) / totalChecks) * 100
        : 0;

      const avgLatencyMs = latencies.length > 0
        ? latencies.reduce((a, b) => a + b, 0) / latencies.length
        : 0;
      const maxLatencyMs = latencies.length > 0 ? Math.max(...latencies) : 0;
      const minLatencyMs = latencies.length > 0 ? Math.min(...latencies) : 0;

      // Hitung insiden downtime menggunakan timestamp nyata dari InfluxDB
      let downtimeIncidents = 0;
      let totalDowntimeSeconds = 0;
      let wasUp = true;
      let downtimeStart: Date | null = null;

      for (let i = 0; i < isUpChecks.length; i++) {
        const { time, isUp } = isUpChecks[i];
        if (wasUp && !isUp) {
          downtimeIncidents++;
          downtimeStart = time;
        } else if (!wasUp && isUp && downtimeStart !== null) {
          // Durasi downtime dihitung dari selisih waktu nyata
          const diffSeconds = Math.round((time.getTime() - downtimeStart.getTime()) / 1000);
          totalDowntimeSeconds += diffSeconds;
          downtimeStart = null;
        }
        wasUp = isUp;
      }

      // Optimasi Edge-Case: Jika status di akhir hari masih down,
      // akumulasikan durasi downtime hingga check terakhir hari itu
      if (downtimeStart !== null && isUpChecks.length > 0) {
        const lastCheckTime = isUpChecks[isUpChecks.length - 1].time;
        const diffSeconds = Math.round((lastCheckTime.getTime() - downtimeStart.getTime()) / 1000);
        totalDowntimeSeconds += diffSeconds;
      }

      summaries.push({
        projectId,
        configId,
        url,
        date,
        avgLatencyMs: Math.round(avgLatencyMs * 100) / 100,
        maxLatencyMs: Math.round(maxLatencyMs * 100) / 100,
        minLatencyMs: Math.round(minLatencyMs * 100) / 100,
        uptimePercent: Math.round(uptimePercent * 100) / 100,
        totalChecks,
        failedChecks,
        downtimeIncidents,
        totalDowntimeSeconds,
      });
    }

    return summaries;
  }

  /**
   * Ambil laporan ringkasan harian untuk sebuah project.
   */
  async getSummariesByProject(projectId: string, days = 30): Promise<DailySummary[]> {
    return this.dailySummaryRepository.findLatestByProject(projectId, days);
  }
}
