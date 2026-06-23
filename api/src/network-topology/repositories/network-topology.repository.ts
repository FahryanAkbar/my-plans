import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NetworkNode } from '../entities/network-node.entity';
import { NetworkEdge, RelationType } from '../entities/network-edge.entity';
import { CreateNodeDto } from '../dto/create-node.dto';
import { CreateEdgeDto } from '../dto/create-edge.dto';
import { UpdateNodeDto } from '../dto/update-node.dto';

@Injectable()
export class NetworkTopologyRepository {
  constructor(
    @InjectRepository(NetworkNode)
    private readonly nodeRepo: Repository<NetworkNode>,
    @InjectRepository(NetworkEdge)
    private readonly edgeRepo: Repository<NetworkEdge>,
  ) {}

  getNodesByProject(projectId: string): Promise<NetworkNode[]> {
    return this.nodeRepo.find({ where: { projectId } });
  }

  getEdgesByProject(projectId: string): Promise<NetworkEdge[]> {
    return this.edgeRepo.find({ where: { projectId } });
  }

  async createNode(
    projectId: string,
    dto: CreateNodeDto,
  ): Promise<NetworkNode> {
    const node = this.nodeRepo.create({ ...dto, projectId });
    return this.nodeRepo.save(node);
  }

  async updateNode(
    id: string,
    dto: UpdateNodeDto,
  ): Promise<NetworkNode | null> {
    await this.nodeRepo.update(id, dto);
    return this.nodeRepo.findOne({ where: { id } });
  }

  async deleteNode(id: string): Promise<void> {
    await this.nodeRepo.delete(id);
  }

  async createEdge(
    projectId: string,
    dto: CreateEdgeDto,
  ): Promise<NetworkEdge> {
    if (dto.sourceId === dto.targetId) {
      throw new Error('Self-loop dependencies are not allowed');
    }

    const relationType = dto.relationType || RelationType.DEPENDS_ON;

    const existing = await this.edgeRepo.findOne({
      where: {
        projectId,
        sourceId: dto.sourceId,
        targetId: dto.targetId,
        relationType,
      },
    });

    if (existing) {
      return existing;
    }

    const edge = this.edgeRepo.create({ ...dto, projectId, relationType });
    return this.edgeRepo.save(edge);
  }

  async deleteEdge(id: string): Promise<void> {
    await this.edgeRepo.delete(id);
  }
}
