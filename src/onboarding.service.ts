import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { MailerService } from './mailer.service';
import { randomInt } from 'crypto';

@Injectable()
export class OnboardingService {
  constructor(private prisma: PrismaService, private mailer: MailerService) {}

  async register(dto: any) {
    try {
      const exists = await this.prisma.user.findFirst({ where: { email: dto.email } });
      if (exists) throw new BadRequestException('Użytkownik o tym e-mail już istnieje');

      const code = (randomInt(100000, 999999)).toString();

      await this.prisma.user.create({
        data: {
          email: dto.email,
          password: dto.password, // w produkcji: zahaszować!
          firstName: dto.firstName,
          lastName: dto.lastName,
          nick: dto.nick,
          role: dto.role,
          consent1: dto.consent1,
          consent2: dto.consent2,
          verificationCode: code,
        },
      });

      // Wysyłka maila z kodem
      await this.mailer.sendMail(
        dto.email,
        'Kod weryfikacyjny Dziki',
        `Twój kod weryfikacyjny: ${code}`
      );

      return {
        success: true,
        message: 'Użytkownik zarejestrowany, kod wysłany na e-mail.',
      };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Błąd serwera podczas rejestracji');
    }
  }

  async verifyEmail(email: string, code: string) {
    try {
      const user = await this.prisma.user.findFirst({ where: { email } });
      if (!user) throw new BadRequestException('Nie znaleziono użytkownika');
      if (user.verificationCode !== code) throw new BadRequestException('Nieprawidłowy kod');

      await this.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true, verificationCode: null },
      });

      return {
        success: true,
        message: 'E-mail zweryfikowany.',
      };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Błąd serwera podczas weryfikacji');
    }
  }

  async resendVerificationCode(email: string) {
    try {
      const user = await this.prisma.user.findFirst({ where: { email } });
      if (!user) throw new BadRequestException('Nie znaleziono użytkownika');
      if (user.isVerified) throw new BadRequestException('E-mail jest już zweryfikowany');

      const code = (randomInt(100000, 999999)).toString();

      await this.prisma.user.update({
        where: { id: user.id },
        data: { verificationCode: code },
      });

      await this.mailer.sendMail(
        email,
        'Nowy kod weryfikacyjny Dziki',
        `Twój nowy kod weryfikacyjny: ${code}`
      );

      return {
        success: true,
        message: 'Nowy kod został wysłany na twój adres e-mail.',
      };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Błąd serwera podczas wysyłania kodu');
    }
  }
}
