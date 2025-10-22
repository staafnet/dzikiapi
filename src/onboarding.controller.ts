import { Body, Controller, Post } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { OnboardingRegisterDto, OnboardingVerifyDto } from './dto/onboarding.dto';
import { UsePipes, ValidationPipe } from '@nestjs/common';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async register(@Body() dto: OnboardingRegisterDto) {
    return this.onboardingService.register(dto);
  }

  @Post('verify-email')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async verifyEmail(@Body() body: OnboardingVerifyDto) {
    return this.onboardingService.verifyEmail(body.email, body.code);
  }

  @Post('resend-code')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async resendVerificationCode(@Body() body: ResendVerificationDto) {
    return this.onboardingService.resendVerificationCode(body.email);
  }
}
