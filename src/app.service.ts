import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'OKO AGRO BACKEND SERVICE';
  }
}
