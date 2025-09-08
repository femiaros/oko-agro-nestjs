import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Crop } from './entities/crop.entity';
import { CreateCropDto } from './dtos/create-crop.dto';

@Injectable()
export class CropsService {
    constructor(
        @InjectRepository(Crop)
        private readonly cropRepository: Repository<Crop>,
    ) {}

    async create(createCropDto: CreateCropDto): Promise<Crop> {
        const { name } = createCropDto

        const existingCrop = await this.cropRepository.findOne({ where: { name: ILike(name) } })

        if (existingCrop) throw new ConflictException('Crop already exists')

        const crop = this.cropRepository.create({ name })
        return this.cropRepository.save(crop)
    }

    async findAll(): Promise<Crop[]> {
        return this.cropRepository.find();
    }
}
