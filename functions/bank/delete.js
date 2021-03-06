const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const authorizer = require('../authorization')

/**
 * @function
 * @type {import('aws-lambda').APIGatewayEvent}
 */
exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false

  const id = event.pathParameters.id
  try {
    const permission = await authorizer(event, 2)
    if (permission === false) {
      return {
        statusCode: 403,
        body: JSON.stringify('User doenst have permission')
      }
    }
    const bankBranch = await prisma.bankBranch.findFirst({
      where: { agencyId: id }
    })
    if (!bankBranch) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'bankBranch doenst exist'
        })
      }
    }

    await prisma.bankBranch.deleteMany({
      where: {agencyId: id}
    })
    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(`Bank: ${bankBranch.agencyId} deleted`)
    }
  } catch (error) {
    console.error(error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(error)
    }
  }
}
