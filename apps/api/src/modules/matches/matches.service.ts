import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.match.findMany({
      include: { events: { include: { child: true } } },
      orderBy: { playedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: { events: { include: { child: true }, orderBy: { minute: 'asc' } } },
    });
    if (!match) throw new NotFoundException('Match not found');
    return match;
  }

  async create(data: {
    title: string;
    opponent: string;
    playedAt: string;
    venue?: string;
    groupName?: string;
    homeScore?: number;
    awayScore?: number;
  }) {
    return this.prisma.match.create({
      data: {
        title: data.title,
        opponent: data.opponent,
        playedAt: new Date(data.playedAt),
        venue: data.venue,
        groupName: data.groupName,
        homeScore: data.homeScore ?? 0,
        awayScore: data.awayScore ?? 0,
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      opponent: string;
      playedAt: string;
      venue: string;
      groupName: string;
      homeScore: number;
      awayScore: number;
    }>,
  ) {
    await this.ensureExists(id);
    return this.prisma.match.update({
      where: { id },
      data: {
        ...data,
        playedAt: data.playedAt ? new Date(data.playedAt) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.match.delete({ where: { id } });
  }

  async addEvent(
    matchId: string,
    data: {
      childId: string;
      type: 'GOAL' | 'ASSIST' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION';
      minute?: number;
      note?: string;
    },
  ) {
    await this.ensureExists(matchId);
    return this.prisma.matchEvent.create({
      data: { matchId, ...data },
      include: { child: true },
    });
  }

  async removeEvent(eventId: string) {
    return this.prisma.matchEvent.delete({ where: { id: eventId } });
  }

  private async ensureExists(id: string) {
    const match = await this.prisma.match.findUnique({ where: { id } });
    if (!match) throw new NotFoundException('Match not found');
  }
}
