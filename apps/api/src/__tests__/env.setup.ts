// Tell mongodb-memory-server to use a version/distro available for this host
process.env.MONGOMS_VERSION = '7.0.14'
process.env.MONGOMS_DISTRO = 'ubuntu-22.04'

// Set required environment variables before any module imports
process.env.NODE_ENV = 'test'
process.env.MONGODB_URI = 'mongodb://localhost:27017/adoptame-test'
process.env.JWT_SECRET = 'test-jwt-secret-that-is-at-least-32-chars-long!!'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-that-is-at-least-32-chars!!'
process.env.JWT_EXPIRES_IN = '15m'
process.env.JWT_REFRESH_EXPIRES_IN = '30d'
process.env.FRONTEND_URL = 'http://localhost:3000'
process.env.PORT = '3001'
