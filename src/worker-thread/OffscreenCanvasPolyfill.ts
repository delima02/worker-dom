import { TransferrableMutationType } from '../transfer/TransferrableMutation';
import { HTMLCanvasElement } from './dom/HTMLCanvasElement';
import { TransferrableKeys } from '../transfer/TransferrableKeys';
import {
  CanvasRenderingContext2D,
  ImageSmoothingQuality,
  CanvasTextAlign,
  CanvasTextBaseline,
  CanvasLineCap,
  CanvasLineJoin,
  CanvasDirection,
  CanvasFillRule,
} from './DOMTypes';
import { transfer } from './MutationTransfer';
import { Document } from './dom/Document';
import { NumericBoolean } from '../utils';
import { store } from './strings';

export class OffscreenCanvasPolyfill {
  canvas: HTMLCanvasElement;
  context: OffscreenCanvasRenderingContext2DPolyfill;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  getContext(contextType: string): CanvasRenderingContext2D {
    if (!this.context) {
      if (contextType === '2D' || contextType === '2d') {
        this.context = new OffscreenCanvasRenderingContext2DPolyfill(this.canvas);
      } else {
        throw new Error('Context type not supported.');
      }
    }
    return this.context;
  }
}

class OffscreenCanvasRenderingContext2DPolyfill implements CanvasRenderingContext2D {
  canvas: HTMLCanvasElement;
  lineDash: number[];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.lineDash = [];
  }

  private postToMainThread(fnName: string, isSetter: NumericBoolean, stringArgIndex: number, args: any[], float32Needed: boolean) {
    if (float32Needed) {
      const u16ArgsArray = new Uint16Array(new Float32Array(args).buffer);

      const mutation = [
        TransferrableMutationType.OFFSCREEN_POLYFILL,
        this.canvas[TransferrableKeys.index],
        NumericBoolean.TRUE,
        args.length,
        store(fnName),
        isSetter,
        stringArgIndex,
        ...u16ArgsArray,
      ];

      transfer(this.canvas.ownerDocument as Document, mutation);
    } else {
      transfer(this.canvas.ownerDocument as Document, [
        TransferrableMutationType.OFFSCREEN_POLYFILL,
        this.canvas[TransferrableKeys.index],
        NumericBoolean.FALSE,
        args.length,
        store(fnName),
        isSetter,
        stringArgIndex,
        ...args,
      ]);
    }
  }

  clearRect(x: number, y: number, w: number, h: number): void {
    this.postToMainThread('clearRect', NumericBoolean.FALSE, 0, [...arguments], true);
  }

  fillRect(x: number, y: number, w: number, h: number): void {
    this.postToMainThread('fillRect', NumericBoolean.FALSE, 0, [...arguments], true);
  }

  strokeRect(x: number, y: number, w: number, h: number): void {
    this.postToMainThread('strokeRect', NumericBoolean.FALSE, 0, [...arguments], true);
  }

  set lineWidth(value: number) {
    this.postToMainThread('lineWidth', NumericBoolean.TRUE, 0, [...arguments], true);
  }

  fillText(text: string, x: number, y: number, maxWidth?: number) {
    const numberArgs = [...arguments].slice(1);
    this.postToMainThread('fillText', NumericBoolean.FALSE, 1, [store(text), ...numberArgs], true);
  }

  moveTo(x: number, y: number) {
    this.postToMainThread('moveTo', NumericBoolean.FALSE, 0, [...arguments], true);
  }

  lineTo(x: number, y: number) {
    this.postToMainThread('lineTo', NumericBoolean.FALSE, 0, [...arguments], true);
  }

  closePath() {
    this.postToMainThread('closePath', NumericBoolean.FALSE, 0, [...arguments], false);
  }

  stroke() {
    this.postToMainThread('stroke', NumericBoolean.FALSE, 0, [...arguments], false);
  }

  restore() {
    this.postToMainThread('restore', NumericBoolean.FALSE, 0, [...arguments], false);
  }

  save() {
    this.postToMainThread('save', NumericBoolean.FALSE, 0, [...arguments], false);
  }

  resetTransform() {
    this.postToMainThread('resetTransform', NumericBoolean.FALSE, 0, [...arguments], false);
  }

  rotate(angle: number) {
    this.postToMainThread('rotate', NumericBoolean.FALSE, 0, [...arguments], true);
  }

  transform(a: number, b: number, c: number, d: number, e: number, f: number) {
    this.postToMainThread('transform', NumericBoolean.FALSE, 0, [...arguments], true);
  }

  translate(x: number, y: number) {
    this.postToMainThread('translate', NumericBoolean.FALSE, 0, [...arguments], true);
  }

  scale(x: number, y: number) {
    this.postToMainThread('scale', NumericBoolean.FALSE, 0, [...arguments], true);
  }

  set globalAlpha(value: number) {
    this.postToMainThread('globalAlpha', NumericBoolean.TRUE, 0, [...arguments], true);
  }

  set globalCompositeOperation(value: string) {
    this.postToMainThread('globalCompositeOperation', NumericBoolean.TRUE, 1, [store(value)], false);
  }

  set imageSmoothingQuality(value: ImageSmoothingQuality) {
    this.postToMainThread('imageSmoothingQuality', NumericBoolean.TRUE, 1, [store(value)], false);
  }

  set fillStyle(value: string) {
    this.postToMainThread('fillStyle', NumericBoolean.TRUE, 1, [store(value)], false);
  }

  set strokeStyle(value: string) {
    this.postToMainThread('strokeStyle', NumericBoolean.TRUE, 1, [store(value)], false);
  }

  set shadowBlur(value: number) {
    this.postToMainThread('shadowBlur', NumericBoolean.TRUE, 0, [...arguments], true);
  }

  set shadowColor(value: string) {
    this.postToMainThread('shadowColor', NumericBoolean.TRUE, 1, [store(value)], false);
  }

  set shadowOffsetX(value: number) {
    this.postToMainThread('shadowOffsetX', NumericBoolean.TRUE, 0, [...arguments], true);
  }

  set shadowOffsetY(value: number) {
    this.postToMainThread('shadowOffsetY', NumericBoolean.TRUE, 0, [...arguments], true);
  }

  set filter(value: string) {
    this.postToMainThread('filter', NumericBoolean.TRUE, 1, [store(value)], false);
  }

  beginPath() {
    this.postToMainThread('beginPath', NumericBoolean.FALSE, 0, [...arguments], false);
  }

  strokeText(text: string, x: number, y: number, maxWidth?: number) {
    const numberArgs = [...arguments].slice(1);
    this.postToMainThread('strokeText', NumericBoolean.FALSE, 1, [store(text), ...numberArgs], true);
  }

  set textAlign(value: CanvasTextAlign) {
    this.postToMainThread('textAlign', NumericBoolean.TRUE, 1, [store(value)], false);
  }

  set textBaseline(value: CanvasTextBaseline) {
    this.postToMainThread('textBaseline', NumericBoolean.TRUE, 1, [store(value)], false);
  }

  set lineCap(value: CanvasLineCap) {
    this.postToMainThread('lineCap', NumericBoolean.TRUE, 1, [store(value)], false);
  }

  set lineDashOffset(value: number) {
    this.postToMainThread('lineDashOffset', NumericBoolean.TRUE, 0, [...arguments], true);
  }

  set lineJoin(value: CanvasLineJoin) {
    this.postToMainThread('lineJoin', NumericBoolean.TRUE, 1, [store(value)], false);
  }

  set miterLimit(value: number) {
    this.postToMainThread('miterLimit', NumericBoolean.TRUE, 0, [...arguments], true);
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean) {
    this.postToMainThread('arc', NumericBoolean.FALSE, 0, [...arguments], true);
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number) {
    this.postToMainThread('arcTo', NumericBoolean.FALSE, 0, [...arguments], true);
  }

  set direction(value: CanvasDirection) {
    this.postToMainThread('direction', NumericBoolean.TRUE, 1, [store(value)], false);
  }

  set font(value: string) {
    this.postToMainThread('font', NumericBoolean.TRUE, 1, [store(value)], false);
  }

  ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean) {
    this.postToMainThread('ellipse', NumericBoolean.FALSE, 0, [...arguments], true);
  }

  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) {
    this.postToMainThread('bezierCurveTo', NumericBoolean.FALSE, 0, [...arguments], true);
  }

  rect(x: number, y: number, width: number, height: number) {
    this.postToMainThread('rect', NumericBoolean.FALSE, 0, [...arguments], true);
  }

  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number) {
    this.postToMainThread('quadraticCurveTo', NumericBoolean.FALSE, 0, [...arguments], true);
  }

  set imageSmoothingEnabled(value: boolean) {
    this.postToMainThread('imageSmoothingEnabled', NumericBoolean.TRUE, 0, [...arguments], false);
  }

  setLineDash(lineDash: number[]) {
    this.lineDash = lineDash;
    this.postToMainThread('setLineDash', NumericBoolean.FALSE, 0, lineDash, true);
  }

  getLineDash(): number[] {
    if (this.lineDash.length % 2 === 0) {
      return this.lineDash;
    } else {
      return this.lineDash.concat(this.lineDash);
    }
  }

  clip(pathOrFillRule?: Path2D | CanvasFillRule, fillRule?: CanvasFillRule) {
    if (typeof pathOrFillRule === 'object') {
      throw new Error('clip(Path2D) is currently not supported!');
    }
    this.postToMainThread('clip', NumericBoolean.FALSE, 1, [...arguments], false);
  }

  fill(pathOrFillRule?: Path2D | CanvasFillRule, fillRule?: CanvasFillRule) {
    if (typeof pathOrFillRule === 'object') {
      throw new Error('fill(Path2D) is currently not supported!');
    }
    this.postToMainThread('fill', NumericBoolean.FALSE, 1, [...arguments], false);
  }

  // Method has a different signature in MDN than it does in HTML spec
  setTransform(transformOrA?: DOMMatrix2DInit | number, bOrC?: number, cOrD?: number, dOrE?: number, eOrF?: number, f?: number) {
    if (typeof transformOrA === 'object') {
      throw new Error('setTransform(DOMMatrix2DInit) is currently not supported!');
    }
    this.postToMainThread('setTransform', NumericBoolean.FALSE, 0, [...arguments], true);
  }

  ////////////////////////////////////////
  // The following methods require more to our transfer process:
  createLinearGradient(): CanvasGradient {
    return {} as CanvasGradient;
  }
  createPattern(): CanvasPattern {
    return {} as CanvasPattern;
  }
  createRadialGradient(): CanvasGradient {
    return {} as CanvasGradient;
  }

  // issue: has more than one signature, one with a Path2D arg
  isPointInPath(): boolean {
    return true;
  }

  // issue: has more than one signature, one with a Path2D arg
  isPointInStroke(): boolean {
    return true;
  }

  // issue: has a return value
  measureText(): TextMetrics {
    return {} as TextMetrics;
  }

  createImageData(): ImageData {
    return {} as ImageData;
  }
  getImageData(): ImageData {
    return {} as ImageData;
  }
  putImageData() {}

  // issue: has four signatures, all of them with a CanvasImageSource arg
  drawImage() {}
}
