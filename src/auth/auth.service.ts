import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { DeepPartial, ILike, In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dtos/register-user.dto';
import { Crop } from '../crops/entities/crop.entity';
import { FilesService } from 'src/files/files.service';
import { LoginUserDto } from './dtos/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { Buffer } from 'buffer';
import * as otpGenerator from 'otp-generator';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        @InjectRepository(Crop) private readonly cropRepository: Repository<Crop>,
        private readonly filesService: FilesService,
        private readonly jwtService: JwtService,
        private readonly mailerService: MailerService,
    ){}

    async registerUser(registerUserDto: RegisterUserDto){
        const { confirmPassword, cropIds, userPhoto, farmPhoto, ...userData } = registerUserDto

        // Check userPhoto
        if (registerUserDto.userPhoto) {
            if (!this.isValidImageType(registerUserDto.userPhoto)) 
                throw new BadRequestException('userPhoto: Only jpeg/png images are allowed');

            if (!this.isValidatePhotoSize(registerUserDto.userPhoto))
                throw new BadRequestException('userPhoto: Image size must be 2MB or less');
        }

        // Check userPhoto
        if (registerUserDto.farmPhoto) {
            if (!this.isValidImageType(registerUserDto.farmPhoto)) 
                throw new BadRequestException('farmPhoto: Only jpeg/png images are allowed');

            if (!this.isValidatePhotoSize(registerUserDto.farmPhoto))
                throw new BadRequestException('farmPhoto: Image size must be 2MB or less');
        }

        // Check existingUser
        const existingUser = await this.usersRepository.findOne({where: { email: ILike(registerUserDto.email) }})

        if (registerUserDto.password !== registerUserDto.confirmPassword) throw new ConflictException('Passwords do not match.')

        if(existingUser) throw new ConflictException('Email already in use.');

        // Fetch crops from DB
        let crops: Crop[] = [];
        if (cropIds && cropIds.length > 0) {
            crops = await this.cropRepository.findBy({ id: In(cropIds) });
            if (crops.length !== cropIds.length) throw new BadRequestException('One or more crop IDs are invalid')
        }

        const hashedPassword = await this.hashPassword(registerUserDto.password);

        const newUser = this.usersRepository.create({
            ...userData,
            password: hashedPassword,
            crops
        } as DeepPartial<User>);

        // Save user first (so we have an id for relation)
        const savedUser = await this.usersRepository.save(newUser);

        // Upload photos if provided
        if (registerUserDto.userPhoto) {
            await this.filesService.uploadFile(registerUserDto.userPhoto, 'userPhoto', savedUser)
        }

        if (registerUserDto.farmPhoto) {
            await this.filesService.uploadFile(registerUserDto.farmPhoto, 'farmPhoto', savedUser)
        }

        const otp = this.generateOtp();
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 10);

        savedUser.userVerificationOtp = otp;
        savedUser.userVerificationOtpExpiryTime = expiry;
        await this.usersRepository.save(savedUser);

        // Send OTP email
        const mailResult = await this.mailerService.sendMail(
            savedUser.email,
            'OkoAgro - Verify your account',
            `Your OTP is: ${otp}. It expires in 10 minutes.`,
            `<h2>Your OTP is <b>${otp}</b></h2><p>It expires in 10 minutes.</p>`,
        );

        if (!mailResult.success) {
            return {
                statusCode: 400,
                message: 'Registration completed, but failed to send verification OTP email',
                data: { id: savedUser.id },
            };
        }

        return {
            statusCode: 200,
            message: 'Registration completed, verification OTP sent successfully!',
            data: { id: savedUser.id },
        };

    }

    async loginUser(loginUserDto: LoginUserDto) {
        const existingUser = await this.usersRepository.findOne({ 
            where: { email: loginUserDto.email },
            relations: ['crops'],
        })

        if (!existingUser || !(await this.verifyPassword(loginUserDto.password, existingUser.password))) 
            throw new UnauthorizedException('Invalid credentials or account does not exist')

        if (!existingUser.userVerified) 
            throw new UnauthorizedException('Please verify your account before logging in');
        
        // Generate tokens
        const tokens = this.generateTokens(existingUser)

        const {password, ...userData} = existingUser;

        return {
            statusCode: 200,
            message: 'Login successful',
            data: {
                user: userData,
                tokens
            },
        }
    }

    async resendOtp(userId: string) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) throw new BadRequestException('User not found');

        const otp = this.generateOtp();
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 10);

        user.userVerificationOtp = otp;
        user.userVerificationOtpExpiryTime = expiry;
        await this.usersRepository.save(user);

        const mailResult = await this.mailerService.sendMail(
            user.email,
            'OkoAgro - New OTP Code',
            `Your OTP is: ${otp}. It expires in 10 minutes.`,
            `<h2>Your OTP is <b>${otp}</b></h2><p>It expires in 10 minutes.</p>`,
        );

        if (!mailResult.success) {
            return {
                statusCode: 400,
                message: 'OTP generated but failed to send email',
            };
        }

        return { statusCode: 200, message: 'OTP resent successfully' };
    }

    async verifyOtp(userId: string, otp: string) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) throw new BadRequestException('Invalid email or OTP');

        if (user.userVerified) {
            return { statusCode: 200, message: 'User already verified' };
        }

        if (user.userVerificationOtp !== otp) {
            throw new BadRequestException('Invalid OTP');
        }

        if (new Date() > user.userVerificationOtpExpiryTime!) {
            throw new BadRequestException('OTP expired');
        }

        user.userVerified = true;
        user.userVerificationOtp = null;
        user.userVerificationOtpExpiryTime = null;
        await this.usersRepository.save(user);

        return { statusCode: 200, message: 'User verified successfully' };
    }



    async getRefreshToken(refreshToken: string) {
        try{
            const payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET })

            const user = await this.usersRepository.findOne({ where: {id: payload.sub} })

            if (!user) throw new UnauthorizedException('Invalid token')

            const accessToken = this.generateAccessToken(user)
            return { accessToken }
        }catch(e){
            throw new UnauthorizedException('Invalid token')
        }
    }

    async getUserById(userId: string) {
        try{
            const user = await this.usersRepository.findOne({ where: {id: userId} })

            if (!user) throw new UnauthorizedException('User not found')

            const {password, ...userData} = user;
            return userData
        }catch(e){
            throw new UnauthorizedException('Error occured while fetching user')
        }
    }

    // ***HELPER METHODS***

    private async hashPassword(password : string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword)
    }

    private generateTokens(user: User) {
        return {
            accessToken: this.generateAccessToken(user),
            refreshToken: this.generateRefreshToken(user)
        }
    }

    private generateAccessToken(user: User): string {
        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role
        }

        return this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: '5m' // 15m
        })
    }

    private generateRefreshToken(user: User): string {
        const payload = {
            sub: user.id
        };

        return this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '15m' // '7d'
        })
    }

    private isValidImageType(base64: string): boolean {
        try {
            const headerMatch = base64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);

            if (headerMatch && headerMatch[1]) {
                const mimeType = headerMatch[1].toLowerCase();
                return ['image/jpeg', 'image/jpg', 'image/png'].includes(mimeType);
            }

            // Fallback: check magic numbers
            const base64Data = base64.replace(/^data:.*;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');

            // JPEG
            if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;

            // PNG
            if (
                buffer[0] === 0x89 &&
                buffer[1] === 0x50 &&
                buffer[2] === 0x4e &&
                buffer[3] === 0x47
            ) return true;

            return false;
        } catch (error) {
            console.error('Error in isValidImageType:', error);
            return false;
        }
    }

    private isValidatePhotoSize(base64: string): boolean {
        try {
            // Strip out header (case-insensitive)
            const base64Data = base64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '');

            // Remove padding chars
            const padding = (base64Data.match(/=*$/) || [''])[0].length;

            // Calculate size in bytes
            const sizeInBytes = (base64Data.length * 3) / 4 - padding;

            return sizeInBytes <= 2 * 1024 * 1024; // 2MB
        } catch {
            return false;
        }
    }

    private generateOtp(): string {
        return otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
        });
    }

}