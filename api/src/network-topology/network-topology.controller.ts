import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { NetworkTopologyService } from './network-topology.service';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { CreateEdgeDto } from './dto/create-edge.dto';

@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@Controller('network-topology')
export class NetworkTopologyController {
  constructor(private readonly topologyService: NetworkTopologyService) {}

  /** GET /network-topology/:projectId → Ambil seluruh topology (nodes + edges) */
  @Get(':projectId')
  getTopology(@Param('projectId') projectId: string) {
    return this.topologyService.getTopology(projectId);
  }

  /** POST /network-topology/:projectId/nodes → Tambah node baru */
  @Post(':projectId/nodes')
  createNode(
    @Param('projectId') projectId: string,
    @Body() dto: CreateNodeDto,
  ) {
    return this.topologyService.createNode(projectId, dto);
  }

  /** PATCH /network-topology/:projectId/nodes/:nodeId → Update koordinat atau info node */
  @Patch(':projectId/nodes/:nodeId')
  updateNode(@Param('nodeId') nodeId: string, @Body() dto: UpdateNodeDto) {
    return this.topologyService.updateNode(nodeId, dto);
  }

  /** DELETE /network-topology/:projectId/nodes/:nodeId → Hapus node + edge-nya */
  @Delete(':projectId/nodes/:nodeId')
  deleteNode(
    @Param('projectId') projectId: string,
    @Param('nodeId') nodeId: string,
  ) {
    return this.topologyService.deleteNode(projectId, nodeId);
  }

  /** POST /network-topology/:projectId/edges → Tambah relasi dependensi */
  @Post(':projectId/edges')
  createEdge(
    @Param('projectId') projectId: string,
    @Body() dto: CreateEdgeDto,
  ) {
    return this.topologyService.createEdge(projectId, dto);
  }

  /** DELETE /network-topology/:projectId/edges/:edgeId → Hapus relasi */
  @Delete(':projectId/edges/:edgeId')
  deleteEdge(
    @Param('projectId') projectId: string,
    @Param('edgeId') edgeId: string,
  ) {
    return this.topologyService.deleteEdge(projectId, edgeId);
  }

  /**
   * GET /network-topology/:projectId/impact/:configId
   * Hitung node mana yang terdampak jika config ini down (BFS traversal)
   */
  @Get(':projectId/impact/:configId')
  getImpactAnalysis(
    @Param('projectId') projectId: string,
    @Param('configId') configId: string,
  ) {
    return this.topologyService.getImpactedNodes(projectId, configId);
  }
}
