import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Certification } from './entities/certification.entity';
import { CreateCertificationDto } from './dtos/create-certification.dto';

@Injectable()
export class CertificationsService {
    constructor(
        @InjectRepository(Certification)
        private readonly certificationRepository: Repository<Certification>,
    ) {}

    async create(createCertificationDto: CreateCertificationDto): Promise<Certification> {
        const { name } = createCertificationDto

        const existingCertification = await this.certificationRepository.findOne({ where: { name: ILike(name) } })

        if (existingCertification) throw new ConflictException('Certification already exists')

        const crop = this.certificationRepository.create({ name })
        return this.certificationRepository.save(crop)
    }

    async findAll(): Promise<Certification[]> {
        return this.certificationRepository.find();
    }
}
