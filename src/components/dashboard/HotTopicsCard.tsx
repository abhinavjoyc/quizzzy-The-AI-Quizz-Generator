import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { prisma } from "@/lib/db";

type Props = {};

const HotTopicsCard = async (props: Props) => {
  const topics = await prisma.topic_count.findMany({
    take: 10, // Fetch only 5 topics
    orderBy: {
      count: "desc", // Optional: Sort by count if you want the hottest topics
    },
  });

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Hot Topics</CardTitle>
        <CardDescription>
          Hot topics that u guys may wanna look into
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {topics.map((topic) => (
          <p key={topic.id} className="text-lg font-medium">
            {topic.topic}
          </p>
        ))}
      </CardContent>
    </Card>
  );
};

export default HotTopicsCard;
