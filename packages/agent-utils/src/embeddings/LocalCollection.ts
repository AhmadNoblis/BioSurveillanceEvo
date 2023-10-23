import { EmbeddingApi } from "./EmbeddingApi";
import { normalize, normalizedCosineSimilarity } from "./utils";
import { LocalDocumentStore } from "./LocalDocumentStore";
import { BaseDocumentMetadata, LocalDocument } from "./LocalDocument";
import { Workspace } from "../sys";
import path from "path-browserify";
import { getTextFromNextChunks, getTextFromPriorChunks } from "../chunking/utils";

export class LocalCollection<TMetadata extends BaseDocumentMetadata = BaseDocumentMetadata> {
  private documentStore: LocalDocumentStore<TMetadata>;

  constructor(
    public readonly uri: string,
    private embeddingApi: EmbeddingApi,
    private workspace: Workspace
  ) {
    this.documentStore = new LocalDocumentStore<TMetadata>(this.workspace, uri);
  }

  get name(): string {
    return path.basename(this.uri);
  }

  async add(items: string[], metadatas?: TMetadata[]): Promise<void>{
    if (!items.length) {
      return;
    }

    const results = await this.embeddingApi.createEmbeddings(items);
    let idx = 0;

    for await (const result of results) {
      const metadata = metadatas && metadatas.length > idx ?
        metadatas[idx] :
        undefined;

      this.documentStore.add({
        text: result.input,
        vector: result.embedding,
        metadata
      });
      idx += 1;
    }
  }

  async search(query: string, limit?: number): Promise<LocalDocument<TMetadata>[]> {
    const queryEmbeddingResults = await this.embeddingApi.createEmbeddings(query);
    const queryVector = queryEmbeddingResults[0].embedding;
    const normalizedQueryVector = normalize(queryVector);

    const documents = this.documentStore.list();

    const scores = documents.map(document => {
      const vector = document.vector();
      const normalizedVector = normalize(vector);

      const score = normalizedCosineSimilarity(queryVector, normalizedQueryVector, vector, normalizedVector);
      return { document, score };
    })

    const sortedScores = scores.sort((a, b) => b.score - a.score);

    const results = sortedScores.map(({ document }) => {
      return document
    })

    return limit ? results.slice(0, limit) : results;
  }

  async searchWithSurroundingContext(query: string, opts: { surroundingCharacters: number, overlap?: number, limit?: number }) {
    const { surroundingCharacters, overlap, limit } = opts;
    const halfSurroundChars = Math.floor(surroundingCharacters / 2);
    
    const results = await this.search(query);

    const resultsSortedByIndex = this.sortDocumentsByIndex(results);

    const surroundedResults = results.map(result => {
      const resultIndex = result.metadata()!.index;

      const textBehind = getTextFromPriorChunks({
        sortedElements: resultsSortedByIndex,
        currentIndex: resultIndex,
        overlap: overlap ?? 0,
        characterLimit: halfSurroundChars
      })

      const textForward = getTextFromNextChunks({
        sortedElements: resultsSortedByIndex,
        currentIndex: resultIndex,
        overlap: overlap ?? 0,
        characterLimit: halfSurroundChars
      })

      const withSurrounding = [textBehind, result.text(), textForward].join("")

      return {
        match: result,
        withSurrounding
      }
    })

    return limit ? surroundedResults.slice(0, limit) : surroundedResults;
  }

  async searchUnique(query: string, limit: number): Promise<LocalDocument<TMetadata>[]> {
    const queryEmbeddingResults = await this.embeddingApi.createEmbeddings(query);
    const queryVector = queryEmbeddingResults[0].embedding;
    const normalizedQueryVector = normalize(queryVector);

    const documents = this.documentStore.list();

    const scores = documents.map(document => {
      const vector = document.vector();
      const normalizedVector = normalize(vector);

      const score = normalizedCosineSimilarity(queryVector, normalizedQueryVector, vector, normalizedVector);
      return { document, score, text: document.text() };
    })

    const sortedScores = [...new Map(scores.map(x =>
      [x.text, x])).values()]
      .sort((a, b) => b.score - a.score);
    
    const topScores = sortedScores.slice(0, limit);

    const results = topScores.map(({ document }) => {
      return document
    })

    return results;
  }

  save(): void {
    this.workspace.mkdirSync(this.uri, { recursive: true });
  }

  delete(): void {
    this.workspace.rmdirSync(this.uri, { recursive: true });
  }

  private sortDocumentsByIndex(documents: LocalDocument<TMetadata>[]): LocalDocument<TMetadata>[] {
    return documents.slice().sort(
      (a, b) => {
        if (a.metadata().index === undefined) {
          throw new Error(`Found document with id '${a.id}' but no index`)
        }

        if (!b.metadata().index === undefined) {
          throw new Error(`Found document with id '${b.id}' but no index`)
        }

        return a.metadata().index - b.metadata().index
      }
    );
  }
}
