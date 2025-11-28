import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Segurança
  app.use(helmet());
  
  // CORS - permitir acesso de qualquer origem em desenvolvimento
  const corsOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000', 'http://localhost:8080', 'http://10.30.1.8:3000', 'http://10.30.1.8:8080'];
  
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? corsOrigins 
      : true, // Em desenvolvimento, aceita qualquer origem
    credentials: true,
  });

  // Validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Prefixo global
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

  // Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Sistema de Estoque TI HSI')
    .setDescription('API REST para gerenciamento de estoque de TI')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticação e autorização')
    .addTag('assets', 'Gestão de ativos')
    .addTag('categories', 'Categorias de ativos')
    .addTag('locations', 'Localizações')
    .addTag('licenses', 'Licenças de software')
    .addTag('users', 'Usuários')
    .addTag('import', 'Importação de dados')
    .addTag('reports', 'Relatórios e exportações')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.API_PORT || 3001;
  await app.listen(port);

  console.log(`🚀 API rodando em http://localhost:${port}`);
  console.log(`📚 Documentação Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
