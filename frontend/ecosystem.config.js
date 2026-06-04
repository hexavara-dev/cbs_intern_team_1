module.exports = {
  apps: [
    {
      name: "hexavara-cbs-frontend",
      // Menggunakan file standalone server.js yang dihasilkan oleh 'next build'
      script: "./.next/standalone/server.js",
      instances: "max",       // Menggunakan semua core CPU yang tersedia (atau angka tertentu, misal: 2)
      exec_mode: "cluster",    // Mode cluster untuk performa dan zero-downtime reload
      watch: false,
      env: {
        PORT: 3000,
        NODE_ENV: "production",
      },
    },
  ],
};
