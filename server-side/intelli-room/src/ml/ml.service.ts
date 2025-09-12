import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { spawn } from 'child_process';
import { MLOutput } from '../users/entities/user.entity';
import { join } from 'path';

@Injectable()
export class MlService {
  async processImage(imagePath: string): Promise<MLOutput> {
    const pythonExecutable = 'python3'; // Use 'python' or 'python3' based on your system
    const scriptPath = join(__dirname, 'ml-model.py');

    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(pythonExecutable, [scriptPath, imagePath]);
      let output = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error(`Python script stderr: ${data}`);
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python script exited with code ${code}`);
          reject(
            new InternalServerErrorException('ML model processing failed.'),
          );
        }

        try {
          const mlOutput: MLOutput = JSON.parse(output);
          resolve(mlOutput);
        } catch (error) {
          console.error(
            'Failed to parse JSON output from Python script.',
            error,
          );
          reject(
            new InternalServerErrorException('Invalid output from ML model.'),
          );
        }
      });
    });
  }
}
