import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { QualityStandard } from './entities/quality-standard.entity';
import { CreateQualityStandardDto } from './dtos/create-quality-standard.dto';

@Injectable()
export class QualityStandardsService {
    constructor(
        @InjectRepository(QualityStandard)
        private readonly qualityStandardRepository: Repository<QualityStandard>,
    ) {}

    async create(createQualityStandardDto: CreateQualityStandardDto): Promise<QualityStandard> {
        const { name } = createQualityStandardDto

        const existingStandard = await this.qualityStandardRepository.findOne({ where: { name: ILike(name) } })

        if (existingStandard) throw new ConflictException('QualityStandard already exists')

        const crop = this.qualityStandardRepository.create({ name })
        return this.qualityStandardRepository.save(crop)
    }

    async findAll(): Promise<QualityStandard[]> {
        return this.qualityStandardRepository.find();
    }
}
