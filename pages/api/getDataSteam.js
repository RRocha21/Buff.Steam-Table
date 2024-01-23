import { connectToDatabase } from '../../util/mongodb';

export default async function handler(req, res) {
  const { db } = await connectToDatabase();
  const data = await db.collection('Steam2Buff').find({}).toArray();
  const properties = JSON.parse(JSON.stringify(data));

  res.status(200).json(properties);
}