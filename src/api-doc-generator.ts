import { OpenAPIObject } from '@nestjs/swagger';
import * as fs from 'fs/promises';

export const generateApiDocFile = (document: OpenAPIObject) => {
  const serializedDocument = JSON.stringify(document, null, 2);
  return fs.writeFile('api-doc.json', serializedDocument, { encoding: 'utf-8' });
};
