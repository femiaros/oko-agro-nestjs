import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/register-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register-user')
    async registerUser(@Body() registerUserDto: RegisterUserDto) {
        return await this.authService.registerUser(registerUserDto)
    }
    
    @Post('login-user')
    async loginUser(@Body() loginUserDto: LoginUserDto) {
        return await this.authService.loginUser(loginUserDto)
    }

    @Post('refresh')
    async refreshToken(@Body('refreshToken') refreshToken: string) {
        return await this.authService.getRefreshToken(refreshToken)
    }

    // ✅ Verify OTP
    @Post('verify-otp')
    async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto ) {
        return this.authService.verifyOtp(verifyOtpDto.userId, verifyOtpDto.otp);
    }

    // ✅ Resend OTP
    @Post('resend-otp')
    async resendOtp(@Body() body: { userId: string }) {
        return this.authService.resendOtp(body.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@CurrentUser() user: any){
        return user;
    }
}