// PM2 config para despliegue en Hostinger Node.js
module.exports = {
  apps: [
    {
      name: 'rado-belempampa',
      script: 'server.js',
      cwd: '/home/u_XXXXX/public_html',  // <-- Ajustar al path real en Hostinger
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
        // Variables de base de datos (configurar en Hostinger o .env.production)
        DB_USER: 'postgres.lwuhsendnfwxenoryuzs',
        DB_HOST: 'aws-1-us-east-1.pooler.supabase.com',
        DB_PORT: '6543',
        DB_NAME: 'postgres',
        // DB_PASSWORD: configurar en Hostinger como variable de entorno segura
      },
    },
  ],
};
