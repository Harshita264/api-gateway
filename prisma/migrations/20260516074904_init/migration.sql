-- CreateTable
CREATE TABLE "request_logs" (
    "id" SERIAL NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "apiKey" TEXT,
    "upstreamUrl" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_logs_pkey" PRIMARY KEY ("id")
);
