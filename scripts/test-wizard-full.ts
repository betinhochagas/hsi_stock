/**
 * Script de teste completo do Wizard de Importação CSV
 * 
 * Testa os 3 passos do wizard:
 * 1. Upload + Detect (detecção de formato)
 * 2. Validate (dry-run)
 * 3. Commit (importação final)
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const API_URL = 'http://localhost:3001/api/v1';
const TOKEN = 'seu-token-jwt-aqui'; // Obter via login

interface TestResult {
  step: string;
  success: boolean;
  data?: any;
  error?: any;
  duration: number;
}

class WizardTester {
  private token: string;
  private results: TestResult[] = [];

  constructor(token?: string) {
    this.token = token || '';
  }

  /**
   * Passo 0: Login para obter token
   */
  async login(): Promise<string> {
    const start = Date.now();
    try {
      console.log('🔐 Fazendo login...');
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@hsi.com',
        password: 'admin123',
      });

      this.token = response.data.access_token;
      const duration = Date.now() - start;

      this.results.push({
        step: '0. Login',
        success: true,
        data: { userId: response.data.user.id },
        duration,
      });

      console.log(`✅ Login bem-sucedido (${duration}ms)`);
      return this.token;
    } catch (error: any) {
      const duration = Date.now() - start;
      this.results.push({
        step: '0. Login',
        success: false,
        error: error.response?.data || error.message,
        duration,
      });
      console.error(`❌ Erro no login:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Passo 1: Upload do arquivo
   */
  async uploadFile(filePath: string): Promise<string> {
    const start = Date.now();
    try {
      console.log(`\n📤 Upload do arquivo: ${path.basename(filePath)}`);
      
      const FormData = require('form-data');
      const form = new FormData();
      form.append('file', fs.createReadStream(filePath));

      const response = await axios.post(`${API_URL}/import/upload`, form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${this.token}`,
        },
      });

      const duration = Date.now() - start;
      this.results.push({
        step: '1. Upload',
        success: true,
        data: response.data,
        duration,
      });

      console.log(`✅ Upload concluído (${duration}ms)`);
      console.log(`   - Arquivo: ${response.data.filename}`);
      console.log(`   - Tamanho: ${(response.data.size / 1024).toFixed(2)} KB`);
      console.log(`   - Path: ${response.data.filePath}`);

      return response.data.filePath;
    } catch (error: any) {
      const duration = Date.now() - start;
      this.results.push({
        step: '1. Upload',
        success: false,
        error: error.response?.data || error.message,
        duration,
      });
      console.error(`❌ Erro no upload:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Passo 2: Detect (detecção de formato)
   */
  async detectFormat(filePath: string): Promise<any> {
    const start = Date.now();
    try {
      console.log(`\n🔍 Detectando formato do CSV...`);

      const response = await axios.post(
        `${API_URL}/import/detect`,
        { filePath },
        {
          headers: { Authorization: `Bearer ${this.token}` },
        },
      );

      const duration = Date.now() - start;
      const data = response.data;

      this.results.push({
        step: '2. Detect',
        success: true,
        data,
        duration,
      });

      console.log(`✅ Formato detectado (${duration}ms)`);
      console.log(`   - Encoding: ${data.encoding}`);
      console.log(`   - Delimitador: "${data.delimiter}"`);
      console.log(`   - Total de linhas: ${data.totalRows}`);
      console.log(`   - Tipo detectado: ${data.fileType || 'generic'}`);
      console.log(`   - Headers (${data.headers.length}):`, data.headers.slice(0, 5).join(', ') + (data.headers.length > 5 ? '...' : ''));
      
      if (data.suggestedMappings && data.suggestedMappings.length > 0) {
        console.log(`   - Sugestões de mapeamento (${data.suggestedMappings.length}):`);
        data.suggestedMappings.slice(0, 3).forEach((m: any) => {
          console.log(`     • ${m.csvColumn} → ${m.systemField} (${(m.confidence * 100).toFixed(0)}%)`);
        });
      }

      if (data.stats) {
        console.log(`   - Estatísticas:`);
        console.log(`     • Tempo estimado: ${data.stats.estimatedProcessingTime}`);
        console.log(`     • Linhas vazias: ${data.stats.hasEmptyRows ? 'Sim' : 'Não'}`);
        console.log(`     • Colunas inconsistentes: ${data.stats.hasInconsistentColumns ? 'Sim' : 'Não'}`);
      }

      return data;
    } catch (error: any) {
      const duration = Date.now() - start;
      this.results.push({
        step: '2. Detect',
        success: false,
        error: error.response?.data || error.message,
        duration,
      });
      console.error(`❌ Erro na detecção:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Passo 3: Validate (dry-run)
   */
  async validateImport(filePath: string, detectData: any): Promise<any> {
    const start = Date.now();
    try {
      console.log(`\n✔️  Validando importação (dry-run)...`);

      const response = await axios.post(
        `${API_URL}/import/validate`,
        {
          filePath,
          fileType: detectData.fileType || 'generic',
          config: {
            encoding: detectData.encoding,
            delimiter: detectData.delimiter,
          },
        },
        {
          headers: { Authorization: `Bearer ${this.token}` },
        },
      );

      const duration = Date.now() - start;
      const data = response.data;

      this.results.push({
        step: '3. Validate',
        success: true,
        data,
        duration,
      });

      console.log(`✅ Validação concluída (${duration}ms)`);
      console.log(`   - Status: ${data.isValid ? '✅ Válido' : '❌ Inválido'}`);
      console.log(`   - Linhas válidas: ${data.validRows}`);
      console.log(`   - Linhas com erro: ${data.errorRows}`);
      console.log(`   - Linhas com warning: ${data.warningRows}`);
      
      if (data.stats) {
        console.log(`   - Estatísticas detalhadas:`);
        console.log(`     • Novos ativos: ${data.stats.newAssets}`);
        console.log(`     • Ativos existentes: ${data.stats.existingAssets}`);
        console.log(`     • Novas localizações: ${data.stats.newLocations}`);
        console.log(`     • Novos fabricantes: ${data.stats.newManufacturers}`);
        console.log(`     • Tempo estimado: ${data.stats.estimatedDuration}`);
      }

      if (data.preview) {
        console.log(`   - Preview:`);
        console.log(`     • Ativos a criar: ${data.preview.assetsToCreate?.length || 0}`);
        console.log(`     • Ativos a atualizar: ${data.preview.assetsToUpdate?.length || 0}`);
        console.log(`     • Movimentações a criar: ${data.preview.movementsToCreate || 0}`);
      }

      if (data.errors && data.errors.length > 0) {
        console.log(`   - Erros encontrados (${data.errors.length}):`);
        data.errors.slice(0, 3).forEach((error: any) => {
          console.log(`     • Linha ${error.row}: ${error.message} (${error.field})`);
        });
        if (data.errors.length > 3) {
          console.log(`     ... e mais ${data.errors.length - 3} erros`);
        }
      }

      return data;
    } catch (error: any) {
      const duration = Date.now() - start;
      this.results.push({
        step: '3. Validate',
        success: false,
        error: error.response?.data || error.message,
        duration,
      });
      console.error(`❌ Erro na validação:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Passo 4: Commit (importação final)
   */
  async commitImport(filePath: string, detectData: any, dryOnly: boolean = true): Promise<any> {
    if (dryOnly) {
      console.log(`\n⏭️  Pulando commit (modo dry-run only)`);
      return null;
    }

    const start = Date.now();
    try {
      console.log(`\n💾 Confirmando importação...`);

      const response = await axios.post(
        `${API_URL}/import/commit`,
        {
          filePath,
          fileType: detectData.fileType || 'generic',
          config: {
            encoding: detectData.encoding,
            delimiter: detectData.delimiter,
          },
        },
        {
          headers: { Authorization: `Bearer ${this.token}` },
        },
      );

      const duration = Date.now() - start;
      const data = response.data;

      this.results.push({
        step: '4. Commit',
        success: true,
        data,
        duration,
      });

      console.log(`✅ Importação confirmada (${duration}ms)`);
      console.log(`   - Job ID: ${data.jobId}`);
      console.log(`   - Import Log ID: ${data.importLogId}`);
      console.log(`   - Status: ${data.status}`);
      console.log(`   - Mensagem: ${data.message}`);

      if (data.totalRows) {
        console.log(`   - Total: ${data.totalRows} linhas`);
        console.log(`   - Sucesso: ${data.successRows} linhas`);
        console.log(`   - Erro: ${data.errorRows} linhas`);
      }

      return data;
    } catch (error: any) {
      const duration = Date.now() - start;
      this.results.push({
        step: '4. Commit',
        success: false,
        error: error.response?.data || error.message,
        duration,
      });
      console.error(`❌ Erro no commit:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Executar teste completo
   */
  async runFullTest(csvFilePath: string, doCommit: boolean = false): Promise<void> {
    console.log('═══════════════════════════════════════════════');
    console.log('🧪 TESTE COMPLETO DO WIZARD DE IMPORTAÇÃO CSV');
    console.log('═══════════════════════════════════════════════\n');

    try {
      // Passo 0: Login
      if (!this.token) {
        await this.login();
      }

      // Passo 1: Upload
      const uploadedPath = await this.uploadFile(csvFilePath);

      // Passo 2: Detect
      const detectData = await this.detectFormat(uploadedPath);

      // Passo 3: Validate
      const validateData = await this.validateImport(uploadedPath, detectData);

      // Passo 4: Commit (opcional)
      if (doCommit && validateData.isValid) {
        await this.commitImport(uploadedPath, detectData, false);
      } else {
        await this.commitImport(uploadedPath, detectData, true);
      }

      // Resumo
      this.printSummary();
    } catch (error) {
      console.error('\n❌ Teste falhou:', error);
      this.printSummary();
      process.exit(1);
    }
  }

  /**
   * Imprimir resumo dos resultados
   */
  printSummary(): void {
    console.log('\n═══════════════════════════════════════════════');
    console.log('📊 RESUMO DO TESTE');
    console.log('═══════════════════════════════════════════════\n');

    const totalSteps = this.results.length;
    const successSteps = this.results.filter(r => r.success).length;
    const failedSteps = totalSteps - successSteps;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`Total de passos: ${totalSteps}`);
    console.log(`✅ Sucesso: ${successSteps}`);
    console.log(`❌ Falhou: ${failedSteps}`);
    console.log(`⏱️  Tempo total: ${totalDuration}ms\n`);

    console.log('Detalhamento por passo:');
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`  ${status} ${result.step} (${result.duration}ms)`);
      if (!result.success && result.error) {
        console.log(`     Erro: ${JSON.stringify(result.error)}`);
      }
    });

    console.log('\n═══════════════════════════════════════════════\n');
  }
}

// Executar teste
const csvFile = process.argv[2] || path.join(__dirname, '..', 'HSI Inventário.csv');
const doCommit = process.argv.includes('--commit');

console.log(`Arquivo CSV: ${csvFile}`);
console.log(`Modo: ${doCommit ? 'COMMIT (importação real)' : 'DRY-RUN (apenas validação)'}\n`);

const tester = new WizardTester();
tester.runFullTest(csvFile, doCommit);
