import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/register-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register-user')
    @HttpCode(HttpStatus.CREATED)
    async registerUser(@Body() registerUserDto: RegisterUserDto) {
        return await this.authService.registerUser(registerUserDto)
    }
    
    @Post('login-user')
    @HttpCode(HttpStatus.OK)
    async loginUser(@Body() loginUserDto: LoginUserDto) {
        return await this.authService.loginUser(loginUserDto)
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Body('refreshToken') refreshToken: string) {
        return await this.authService.getRefreshToken(refreshToken)
    }

    // ✅ Verify OTP
    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto ) {
        return this.authService.verifyOtp(verifyOtpDto.userId, verifyOtpDto.otp);
    }

    // ✅ Resend OTP
    @Post('resend-otp')
    @HttpCode(HttpStatus.OK)
    async resendOtp(@Body() body: { userId: string }) {
        return this.authService.resendOtp(body.userId);
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }

    // 🔒 Proctected
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @HttpCode(HttpStatus.OK)
    getProfile(@CurrentUser() user: any){
        return user;
    }
}