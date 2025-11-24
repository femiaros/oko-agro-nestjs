import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/register-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { registerUserResponseDto } from './dtos/response.dto';
import { ResendOtpDto } from './dtos/resend-otp.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({status: 201, description: 'User registered successfully', type: registerUserResponseDto})
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

    @ApiOperation({ summary: 'Refresh access token' })
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Body('refreshToken') refreshToken: string) {
        return await this.authService.getRefreshToken(refreshToken)
    }

    // ✅ Verify OTP
    @ApiOperation({ summary: 'Verify otp sent to user email (User registration-verification)' })
    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto ) {
        return this.authService.verifyOtp(verifyOtpDto.userId, verifyOtpDto.otp);
    }

    // ✅ Resend OTP
    @ApiOperation({ summary: 'Resend user registration-verification otp to user email' })
    @Post('resend-otp')
    @HttpCode(HttpStatus.OK)
    async resendOtp(@Body() body: ResendOtpDto) {
        return this.authService.resendOtp(body.userId);
    }

    @ApiOperation({ summary: 'Forgot-password (Request for reset-password client url)' })
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    @ApiOperation({ summary: 'Reset-password (change a new password)' })
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }

    // Proctected
    @ApiOperation({ summary: 'Get Logged in User profile details' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @HttpCode(HttpStatus.OK)
    getProfile(@CurrentUser() user: any){
        return user;
    }
}