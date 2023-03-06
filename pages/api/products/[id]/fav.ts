import { NextApiRequest, NextApiResponse } from 'next'
import withHandler, { ResponseType } from '@libs/server/withHandler'
import client from '@libs/server/client'
import { withApiSession } from '@libs/server/withSession'

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>,
) {
  const {
    query: { id },
    session: { user },
  } = req
  const alreadyExists = await client.fav.findFirst({
    where: {
      productId: parseInt(id as string),
      userId: user?.id,
    },
  })
  if (alreadyExists) {
    await client.fav.delete({
      where: {
        id: alreadyExists.id,
      },
    })
  } else {
    await client.fav.create({
      data: {
        user: {
          connect: {
            id: user?.id,
          },
        },
        product: {
          connect: {
            id: parseInt(id as string),
          },
        },
      },
    })
  }
  res.json({ ok: true })
}

export default withApiSession(
  withHandler({
    methods: ['POST'],
    handler,
  }),
)
