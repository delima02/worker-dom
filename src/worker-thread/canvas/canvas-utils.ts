/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { TransferrableKeys } from '../../transfer/TransferrableKeys';
import { MessageType, ImageBitmapToWorker } from '../../transfer/Messages';
import { TransferrableMutationType } from '../../transfer/TransferrableMutation';
import { HTMLImageElement } from '../dom/HTMLImageElement';
import { HTMLCanvasElement } from '../dom/HTMLCanvasElement';
import { Document } from '../dom/Document';
import { transfer } from '../MutationTransfer';

export function retrieveImageBitmap(image: HTMLImageElement | HTMLCanvasElement, canvas: HTMLCanvasElement): Promise<any> {
  return new Promise(resolve => {
    const messageHandler = ({ data }: { data: ImageBitmapToWorker }) => {
      if (
        data[TransferrableKeys.type] === MessageType.IMAGE_BITMAP_INSTANCE &&
        data[TransferrableKeys.target][0] === (image as any)[TransferrableKeys.index]
      ) {
        removeEventListener('message', messageHandler);
        const transferredImageBitmap = (data as ImageBitmapToWorker)[TransferrableKeys.data];
        resolve(transferredImageBitmap);
      }
    };

    if (typeof addEventListener !== 'function') {
      throw new Error('addEventListener not a function!');
    } else {
      addEventListener('message', messageHandler);
      transfer(canvas.ownerDocument as Document, [TransferrableMutationType.IMAGE_BITMAP_INSTANCE, (image as any)[TransferrableKeys.index]]);
    }
  });
}