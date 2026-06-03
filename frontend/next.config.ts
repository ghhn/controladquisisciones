import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Standalone output para despliegue en Hostinger/VPS Node.js
  output: 'standalone',

  // Fijar el root de rastreo de archivos al directorio del proyecto (evita warning de lockfiles)
  outputFileTracingRoot: path.join(__dirname),

  // Permitir orígenes de desarrollo en red local
  allowedDevOrigins: [
    '192.168.3.25', 'http://192.168.3.25:3000',
    '192.168.3.64', 'http://192.168.3.64:3000',
    '192.168.3.38', '192.168.3.54', '192.168.3.99',
    'localhost:3000',
    '169.254.16.1', 'http://169.254.16.1:3000',
  ],

  // Limitar CPU para evitar errores EAGAIN en hosting compartido
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;
