/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Desenvolvimento: aceitar acesso de IPs da rede local
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  // Em produção, isso será ignorado automaticamente
  ...(process.env.NODE_ENV === 'development' && {
    // Aceitar requisições de qualquer origem em desenvolvimento
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          ],
        },
      ];
    },
  }),
};

export default nextConfig;
