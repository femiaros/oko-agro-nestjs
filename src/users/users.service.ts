import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleServiceError } from 'src/common/utils/error-handler.util';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Crop } from 'src/crops/entities/crop.entity';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
    ) {}

    async findUserEntity(userId: string): Promise<User> {
        try {
            const user = await this.usersRepository.findOne({
                where: { id: userId, isDeleted: false },
            });

            if (!user) {
                throw new NotFoundException('User not found');
            }

            return user;
        } catch (error) {
            console.error('Error fetching user entity:', error);
            handleServiceError(error, 'An error occurred, while fetching user entity');
            throw error;
        }
    }

    async findUser(userId: string): Promise<any> {
        try {
            const user = await this.usersRepository.findOne({
                where: { id: userId, isDeleted: false },
                relations: [
                    'crops',
                    'certifications',
                    'qualityStandards',
                    'files',
                    'products',
                    'events',
                    'buyRequestsAsBuyer',
                    'buyRequestsAsSeller',
                ], // include all relations
            });

            if (!user) {
                throw new NotFoundException('User not found');
            }

            return {
                statusCode: 200,
                message: 'User fetched successfully',
                data: instanceToPlain(user),
            };
        } catch (error) {
            console.error('Error fetching user:', error);
            handleServiceError(error, 'An error occurred, while fetching user');
        }
    }

    async findProcessors(
        currentUser: User,
        search?: string,
        pageNumber: number = 1,
        pageSize: number = 20,
    ) {
        try {
            // build base query
            const query = this.usersRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.crops', 'crop')
                .where('user.role = :role', { role: UserRole.PROCESSOR })
                .andWhere('user.isDeleted = false');

            // Exclude self if the caller is a processor
            if (currentUser?.role === UserRole.PROCESSOR && currentUser?.id) {
                query.andWhere('user.id != :currentUserId', { currentUserId: currentUser.id });
            }
            
            // Search filter (if provided)
            if (search) {
                query.andWhere(
                    '(LOWER(user.farmName) LIKE :search OR LOWER(user.state) LIKE :search OR LOWER(user.country) LIKE :search OR LOWER(user.farmAddress) LIKE :search)',
                    { search: `%${search.toLowerCase()}%` },
                );
            }

            // total count
            const totalRecord = await query.getCount();

            // pagination
            query.skip((pageNumber - 1) * pageSize).take(pageSize);

            // execute query
            const processorUsers = await query.getMany();

            // crops of current user (perfect match reference)
            const userCropIds = (currentUser.crops || []).map((c: Crop) => c.id);

            // mark perfect matches
            const items = processorUsers.map((processor) => {
                const processorCropIds = (processor.crops || []).map((c) => c.id);
                const hasMatch = processorCropIds.some((id) => userCropIds.includes(id));
                return {
                    id: processor.id,
                    firstName: processor.firstName,
                    lastName: processor.lastName,
                    farmName: processor.farmName,
                    state: processor.state,
                    country: processor.country,
                    farmAddress: processor.farmAddress,
                    crops: processor.crops.map((c) => ({ id: c.id, name: c.name })),
                    perfectMatch: hasMatch,
                };
            });

            // count matches
            const matchedRecord = items.filter((i) => i.perfectMatch).length;

            // put perfect matches on top
            const sortedItems = [
                ...items.filter((i) => i.perfectMatch),
                ...items.filter((i) => !i.perfectMatch),
            ];

            return {
                statusCode: 200,
                message: sortedItems.length < 1 ? 'No processor user found' : 'Processor user(s) fetched successfully',
                data: {
                    items: sortedItems,
                    matchedRecord,
                    totalRecord,
                    pageNumber,
                    pageSize,
                },
            };
        } catch (error) {
            console.error('Error fetching processors:', error);
            handleServiceError(error, 'An error occurred, while fetching processor users');
        }
    }

    async findFarmers(
        currentUser: User,
        search?: string,
        pageNumber: number = 1,
        pageSize: number = 20,
    ) {
        try {
            const query = this.usersRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.crops', 'crop') // join crops for perfectMatch + return
                .where('user.role = :role', { role: UserRole.FARMER })
                .andWhere('user.isDeleted = false');

            // If the caller is a farmer, exclude them
            if (currentUser.role === UserRole.FARMER) {
                query.andWhere('user.id != :currentUserId', { currentUserId: currentUser.id });
            }

            // If search provided, check in farmName, state, country, farmAddress
            if (search) {
                query.andWhere(
                    '(LOWER(user.farmName) LIKE LOWER(:search) OR LOWER(user.state) LIKE LOWER(:search) OR LOWER(user.country) LIKE LOWER(:search) OR LOWER(user.farmAddress) LIKE LOWER(:search))',
                    { search: `%${search}%` },
                );
            }

            // Pagination
            const totalRecord = await query.getCount();

            // pagination
            query.skip((pageNumber - 1) * pageSize).take(pageSize);

            // execute query
            const farmerUsers = await query.getMany();

            // crops of current user (perfect match reference)
            const userCropIds = (currentUser.crops || []).map((c: Crop) => c.id);

            // mark perfect matches
            const items = farmerUsers.map((farmer) => {
                const farmerCropIds = (farmer.crops || []).map((c) => c.id);
                const hasMatch = farmerCropIds.some((id) => userCropIds.includes(id));
                return {
                    id: farmer.id,
                    firstName: farmer.firstName,
                    lastName: farmer.lastName,
                    farmName: farmer.farmName,
                    state: farmer.state,
                    country: farmer.country,
                    farmAddress: farmer.farmAddress,
                    crops: farmer.crops.map((c) => ({ id: c.id, name: c.name })),
                    perfectMatch: hasMatch,
                };
            });

            // count matches
            const matchedRecord = items.filter((i) => i.perfectMatch).length;

            // put perfect matches on top
            const sortedItems = [
                ...items.filter((i) => i.perfectMatch),
                ...items.filter((i) => !i.perfectMatch),
            ];

            return {
                statusCode: 200,
                message: sortedItems.length < 1 ? 'No farmer user found' : 'Farmer user(s) fetched successfully',
                data: {
                    items: sortedItems,
                    matchedRecord,
                    totalRecord,
                    pageNumber,
                    pageSize,
                },
            };
        } catch (error) {
            console.error('Error fetching farmers:', error);
            handleServiceError(error, 'An error occurred, while fetching farmer users');
        }
    }


}
