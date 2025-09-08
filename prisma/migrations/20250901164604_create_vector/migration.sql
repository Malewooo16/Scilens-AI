-- This is an empty migration.-- This is an empty migration.


ALTER TABLE embedding         SET TIFLASH REPLICA 1;


ALTER TABLE embedding
    ADD VECTOR INDEX idx_embedding_embeddings
    ((VEC_COSINE_DISTANCE(embeddings))) USING HNSW;


ALTER TABLE embedding
ADD FULLTEXT INDEX idx_chunkText (chunkText);



