'use strict'
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const CONFIG = require('./app/config/config')
const App = require('./app/app')
const errorHandler = require('./app/middleware/error')

App.use(errorHandler)

App.listen(CONFIG.PORT, function (error) {
  if (error) return console.log(error)
  // console.log(`Servidor corriendo en el Puerto: ${CONFIG.HOST}:${CONFIG.PORT}`);
  console.log(
    `We are live on ${process.env.NODE_ENV} mode on port ${CONFIG.PORT}`
  )
  console.log(`Jobs json: ${CONFIG.HOST}:${CONFIG.PORT}/api/v1/getJobs`)
  // console.log(`Jobs json: ${CONFIG.HOST}:${CONFIG.PORT}/api/v1/getLinkedinJobs`)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red)
  // Close server & exit process
  server.close(() => process.exit(1))
})
