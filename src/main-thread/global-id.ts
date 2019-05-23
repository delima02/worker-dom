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

import { Strings } from './strings';
import { TransferrableArgs } from '../transfer/TransferrableArgs';

interface DeserializedArgs {
  args: unknown[];
  offset: number;
}

const f32 = new Float32Array(1);
const u16 = new Uint16Array(f32.buffer);

export function deserialize(buffer: Uint16Array, offset: number, count: number, strings: Strings): DeserializedArgs {
  const args: unknown[] = [];
  for (let i = 0; i < count; i++) {
    switch (buffer[offset++] as TransferrableArgs) {
      case TransferrableArgs.SmallInt:
        args.push(buffer[offset++]);
        break;

      case TransferrableArgs.Float:
        u16[0] = buffer[offset++];
        u16[1] = buffer[offset++];
        args.push(f32[0]);
        break;

      case TransferrableArgs.String:
        args.push(strings.get(buffer[offset++]));
        break;

      case TransferrableArgs.Array:
        const size = buffer[offset++];
        const des = deserialize(buffer, offset, size, strings);
        args.push(des.args);
        offset = des.offset;
        break;

      case TransferrableArgs.CanvasRenderingContext2D:
        break;

      default:
        throw new Error('cannot deserialize argument');
    }
  }
  return {
    args,
    offset: offset,
  };
}
