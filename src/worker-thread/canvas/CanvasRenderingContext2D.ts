import {
  CanvasRenderingContext2D,
  CanvasDirection,
  CanvasFillRule,
  CanvasImageSource,
  CanvasLineCap,
  CanvasLineJoin,
  CanvasTextAlign,
  CanvasTextBaseline,
  ImageSmoothingQuality,
  CanvasGradient,
  CanvasPattern,
} from './CanvasTypes';
import { MessageType, OffscreenCanvasToWorker } from '../../transfer/Messages';
import { TransferrableKeys } from '../../transfer/TransferrableKeys';
import { transfer } from '../MutationTransfer';
import { TransferrableMutationType } from '../../transfer/TransferrableMutation';
import { OffscreenCanvasPolyfill } from './OffscreenCanvasPolyfill';
import { Document } from '../dom/Document';
import { HTMLElement } from '../dom/HTMLElement';

declare var OffscreenCanvas: any;

export const deferredUpgrades = new WeakMap();

const enum context2DMethodType {
  FUNCTION = 1,
  GETTER = 2,
  SETTER = 3,
}

export function getOffscreenCanvasAsync<ElementType extends HTMLElement>(
  canvas: ElementType,
): Promise<{ getContext(c: '2d'): CanvasRenderingContext2D }> {
  return new Promise((resolve, reject) => {
    const messageHandler = ({ data }: { data: OffscreenCanvasToWorker }) => {
      if (
        data[TransferrableKeys.type] === MessageType.OFFSCREEN_CANVAS_INSTANCE &&
        data[TransferrableKeys.target][0] === canvas[TransferrableKeys.index]
      ) {
        removeEventListener('message', messageHandler);
        const transferredOffscreenCanvas = (data as OffscreenCanvasToWorker)[TransferrableKeys.data];
        resolve(transferredOffscreenCanvas as { getContext(c: '2d'): CanvasRenderingContext2D });
      }
    };

    // TODO: This should only happen in test environemnet. Otherwise, we should throw.
    if (typeof addEventListener !== 'function') {
      const deferred = { resolve, reject };
      deferredUpgrades.set(canvas, deferred);
    } else {
      addEventListener('message', messageHandler);
      transfer(canvas.ownerDocument as Document, [TransferrableMutationType.OFFSCREEN_CANVAS_INSTANCE, canvas[TransferrableKeys.index]]);
    }
  });
}

export class CanvasRenderingContext2DImplementation<ElementType extends HTMLElement> implements CanvasRenderingContext2D {
  private calls = [] as { fnName: string; args: any[]; methodType: context2DMethodType }[];
  private implementation: CanvasRenderingContext2D;
  private upgraded = false;
  private canvasElement: ElementType;

  // TODO: This should only exist in testing environment
  public goodOffscreenPromise: Promise<void>;

  constructor(canvas: ElementType) {
    this.canvasElement = canvas;

    if (typeof OffscreenCanvas === 'undefined') {
      this.implementation = new OffscreenCanvasPolyfill<ElementType>(canvas).getContext('2d');
      this.upgraded = true;
    } else {
      this.implementation = new OffscreenCanvas(0, 0).getContext('2d');
      this.goodOffscreenPromise = getOffscreenCanvasAsync(this.canvasElement).then(instance => {
        this.implementation = instance.getContext('2d');
        this.upgraded = true;
        this.callQueuedCalls();
      });
    }
  }

  private callQueuedCalls() {
    for (const call of this.calls) {
      switch (call.methodType) {
        case context2DMethodType.SETTER:
          (this.implementation as any)[call.fnName] = call.args[0];
          break;
        case context2DMethodType.FUNCTION:
          (this.implementation as any)[call.fnName](...call.args);
          break;
      }
    }
    this.calls.length = 0;
  }

  private delegate(fnName: string, fnArgs: any[], methodType: context2DMethodType) {
    let returnValue;

    switch (methodType) {
      case context2DMethodType.FUNCTION:
        returnValue = (this.implementation as any)[fnName](...fnArgs);
        break;
      case context2DMethodType.SETTER:
        (this.implementation as any)[fnName] = fnArgs[0];
        break;
      case context2DMethodType.GETTER:
        returnValue = (this.implementation as any)[fnName];
        break;
    }
    if (!this.upgraded) {
      this.calls.push({ fnName, args: fnArgs, methodType });
    }
    return returnValue;
  }

  /* DRAWING RECTANGLES */
  clearRect(x: number, y: number, width: number, height: number): void {
    this.delegate('clearRect', [...arguments], context2DMethodType.FUNCTION);
  }

  fillRect(x: number, y: number, width: number, height: number): void {
    this.delegate('fillRect', [...arguments], context2DMethodType.FUNCTION);
  }

  strokeRect(x: number, y: number, width: number, height: number): void {
    this.delegate('strokeRect', [...arguments], context2DMethodType.FUNCTION);
  }

  /* DRAWING TEXT */
  fillText(text: string, x: number, y: number, maxWidth?: number): void {
    this.delegate('fillText', [...arguments], context2DMethodType.FUNCTION);
  }

  strokeText(text: string, x: number, y: number, maxWidth?: number): void {
    this.delegate('strokeText', [...arguments], context2DMethodType.FUNCTION);
  }

  measureText(text: string): TextMetrics {
    return this.delegate('measureText', [...arguments], context2DMethodType.FUNCTION);
  }

  /* LINE STYLES */
  set lineWidth(value: number) {
    this.delegate('lineWidth', [...arguments], context2DMethodType.SETTER);
  }

  get lineWidth(): number {
    return this.delegate('lineWidth', [...arguments], context2DMethodType.GETTER);
  }

  set lineCap(value: CanvasLineCap) {
    this.delegate('lineCap', [...arguments], context2DMethodType.SETTER);
  }

  get lineCap(): CanvasLineCap {
    return this.delegate('lineCap', [...arguments], context2DMethodType.GETTER);
  }

  set lineJoin(value: CanvasLineJoin) {
    this.delegate('lineJoin', [...arguments], context2DMethodType.SETTER);
  }

  get lineJoin(): CanvasLineJoin {
    return this.delegate('lineJoin', [...arguments], context2DMethodType.GETTER);
  }

  set miterLimit(value: number) {
    this.delegate('miterLimit', [...arguments], context2DMethodType.SETTER);
  }

  get miterLimit(): number {
    return this.delegate('miterLimit', [...arguments], context2DMethodType.GETTER);
  }

  getLineDash(): number[] {
    return this.delegate('getLineDash', [...arguments], context2DMethodType.FUNCTION);
  }

  setLineDash(segments: number[]): void {
    this.delegate('setLineDash', [...arguments], context2DMethodType.FUNCTION);
  }

  set lineDashOffset(value: number) {
    this.delegate('lineDashOffset', [...arguments], context2DMethodType.SETTER);
  }

  get lineDashOffset(): number {
    return this.delegate('lineDashOffset', [...arguments], context2DMethodType.GETTER);
  }

  /* TEXT STYLES */
  set font(value: string) {
    this.delegate('font', [...arguments], context2DMethodType.SETTER);
  }

  get font(): string {
    return this.delegate('font', [...arguments], context2DMethodType.GETTER);
  }

  set textAlign(value: CanvasTextAlign) {
    this.delegate('textAlign', [...arguments], context2DMethodType.SETTER);
  }

  get textAlign(): CanvasTextAlign {
    return this.delegate('textAlign', [...arguments], context2DMethodType.GETTER);
  }

  set textBaseline(value: CanvasTextBaseline) {
    this.delegate('textBaseline', [...arguments], context2DMethodType.SETTER);
  }

  get textBaseline(): CanvasTextBaseline {
    return this.delegate('textBaseline', [...arguments], context2DMethodType.GETTER);
  }

  set direction(value: CanvasDirection) {
    this.delegate('direction', [...arguments], context2DMethodType.SETTER);
  }

  get direction(): CanvasDirection {
    return this.delegate('direction', [...arguments], context2DMethodType.GETTER);
  }

  /* FILL AND STROKE STYLES */
  set fillStyle(value: string | CanvasGradient | CanvasPattern) {
    this.delegate('fillStyle', [...arguments], context2DMethodType.SETTER);
  }

  get fillStyle(): string | CanvasGradient | CanvasPattern {
    return this.delegate('fillStyle', [...arguments], context2DMethodType.GETTER);
  }

  set strokeStyle(value: string | CanvasGradient | CanvasPattern) {
    this.delegate('strokeStyle', [...arguments], context2DMethodType.SETTER);
  }

  get strokeStyle(): string | CanvasGradient | CanvasPattern {
    return this.delegate('strokeStyle', [...arguments], context2DMethodType.GETTER);
  }

  /* GRADIENTS AND PATTERNS */
  createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient {
    return this.delegate('createLinearGradient', [...arguments], context2DMethodType.FUNCTION);
  }

  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient {
    return this.delegate('createRadialGradient', [...arguments], context2DMethodType.FUNCTION);
  }

  createPattern(image: CanvasImageSource, repetition: string): CanvasPattern | null {
    return this.delegate('createPattern', [...arguments], context2DMethodType.FUNCTION);
  }

  /* SHADOWS */
  set shadowBlur(value: number) {
    this.delegate('shadowBlur', [...arguments], context2DMethodType.SETTER);
  }

  get shadowBlur(): number {
    return this.delegate('shadowBlur', [...arguments], context2DMethodType.GETTER);
  }

  set shadowColor(value: string) {
    this.delegate('shadowColor', [...arguments], context2DMethodType.SETTER);
  }

  get shadowColor(): string {
    return this.delegate('shadowColor', [...arguments], context2DMethodType.GETTER);
  }

  set shadowOffsetX(value: number) {
    this.delegate('shadowOffsetX', [...arguments], context2DMethodType.SETTER);
  }

  get shadowOffsetX(): number {
    return this.delegate('shadowOffsetX', [...arguments], context2DMethodType.GETTER);
  }

  set shadowOffsetY(value: number) {
    this.delegate('shadowOffsetY', [...arguments], context2DMethodType.SETTER);
  }

  get shadowOffsetY(): number {
    return this.delegate('shadowOffsetY', [...arguments], context2DMethodType.GETTER);
  }

  /* PATHS */
  beginPath(): void {
    this.delegate('beginPath', [...arguments], context2DMethodType.FUNCTION);
  }

  closePath(): void {
    this.delegate('closePath', [...arguments], context2DMethodType.FUNCTION);
  }

  moveTo(x: number, y: number): void {
    this.delegate('moveTo', [...arguments], context2DMethodType.FUNCTION);
  }

  lineTo(x: number, y: number): void {
    this.delegate('lineTo', [...arguments], context2DMethodType.FUNCTION);
  }

  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void {
    this.delegate('bezierCurveTo', [...arguments], context2DMethodType.FUNCTION);
  }

  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
    this.delegate('quadraticCurveTo', [...arguments], context2DMethodType.FUNCTION);
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, antiClockwise?: boolean): void {
    this.delegate('arc', [...arguments], context2DMethodType.FUNCTION);
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void {
    this.delegate('arcTo', [...arguments], context2DMethodType.FUNCTION);
  }

  ellipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    endAngle: number,
    antiClockwise?: boolean,
  ): void {
    this.delegate('ellipse', [...arguments], context2DMethodType.FUNCTION);
  }

  rect(x: number, y: number, width: number, height: number): void {
    this.delegate('rect', [...arguments], context2DMethodType.FUNCTION);
  }

  /* DRAWING PATHS */
  fill(pathOrFillRule?: Path2D | CanvasFillRule, fillRule?: CanvasFillRule): void {
    const args = [...arguments] as [Path2D, CanvasFillRule | undefined] | [CanvasFillRule | undefined];
    this.delegate('fill', args, context2DMethodType.FUNCTION);
  }

  stroke(path?: Path2D): void {
    const args = [...arguments] as [Path2D] | [];
    this.delegate('stroke', args, context2DMethodType.FUNCTION);
  }

  clip(pathOrFillRule?: Path2D | CanvasFillRule, fillRule?: CanvasFillRule): void {
    const args = [...arguments] as [Path2D, CanvasFillRule | undefined] | [CanvasFillRule | undefined];
    this.delegate('clip', args, context2DMethodType.FUNCTION);
  }

  isPointInPath(pathOrX: Path2D | number, xOrY: number, yOrFillRule?: number | CanvasFillRule, fillRule?: CanvasFillRule): boolean {
    const args = [...arguments] as [number, number, CanvasFillRule | undefined] | [Path2D, number, number, CanvasFillRule | undefined];

    return this.delegate('isPointInPath', args, context2DMethodType.FUNCTION);
  }

  isPointInStroke(pathOrX: Path2D | number, xOrY: number, y?: number): boolean {
    const args = [...arguments] as [number, number] | [Path2D, number, number];
    return this.delegate('isPointInStroke', args, context2DMethodType.FUNCTION);
  }

  /* TRANSFORMATIONS */
  rotate(angle: number): void {
    this.delegate('rotate', [...arguments], context2DMethodType.FUNCTION);
  }

  scale(x: number, y: number): void {
    this.delegate('scale', [...arguments], context2DMethodType.FUNCTION);
  }

  translate(x: number, y: number): void {
    this.delegate('translate', [...arguments], context2DMethodType.FUNCTION);
  }

  transform(a: number, b: number, c: number, d: number, e: number, f: number): void {
    this.delegate('transform', [...arguments], context2DMethodType.FUNCTION);
  }

  setTransform(transformOrA?: DOMMatrix2DInit | number, bOrC?: number, cOrD?: number, dOrE?: number, eOrF?: number, f?: number): void {
    const args = [...arguments] as [] | [DOMMatrix2DInit] | [number, number, number, number, number, number];
    this.delegate('setTransform', args, context2DMethodType.FUNCTION);
  }

  /* experimental */ resetTransform(): void {
    this.delegate('resetTransform', [...arguments], context2DMethodType.FUNCTION);
  }

  /* COMPOSITING */
  set globalAlpha(value: number) {
    this.delegate('globalAlpha', [...arguments], context2DMethodType.SETTER);
  }

  get globalAlpha(): number {
    return this.delegate('globalAlpha', [...arguments], context2DMethodType.GETTER);
  }

  set globalCompositeOperation(value: string) {
    this.delegate('globalCompositeOperation', [...arguments], context2DMethodType.SETTER);
  }

  get globalCompositeOperation(): string {
    return this.delegate('globalCompositeOperation', [...arguments], context2DMethodType.GETTER);
  }

  /* DRAWING IMAGES */
  drawImage(image: CanvasImageSource, dx: number, dy: number): void {
    this.delegate('drawImage', [...arguments], context2DMethodType.FUNCTION);
  }

  /* PIXEL MANIPULATION */
  createImageData(imagedataOrWidth: ImageData | number, height?: number): ImageData {
    const args = [...arguments] as [ImageData] | [number, number];
    return this.delegate('createImageData', args, context2DMethodType.FUNCTION);
  }

  getImageData(sx: number, sy: number, sw: number, sh: number): ImageData {
    return this.delegate('getImageData', [...arguments], context2DMethodType.FUNCTION);
  }

  putImageData(imageData: ImageData, dx: number, dy: number, dirtyX?: number, dirtyY?: number, dirtyWidth?: number, dirtyHeight?: number): void {
    this.delegate('putImageData', [...arguments], context2DMethodType.FUNCTION);
  }

  /* IMAGE SMOOTHING */
  /* experimental */ set imageSmoothingEnabled(value: boolean) {
    this.delegate('imageSmoothingEnabled', [...arguments], context2DMethodType.SETTER);
  }

  /* experimental */ get imageSmoothingEnabled(): boolean {
    return this.delegate('imageSmoothingEnabled', [...arguments], context2DMethodType.GETTER);
  }

  /* experimental */ set imageSmoothingQuality(value: ImageSmoothingQuality) {
    this.delegate('imageSmoothingQuality', [...arguments], context2DMethodType.SETTER);
  }

  /* experimental */ get imageSmoothingQuality(): ImageSmoothingQuality {
    return this.delegate('imageSmoothingQuality', [...arguments], context2DMethodType.GETTER);
  }

  /* THE CANVAS STATE */
  save(): void {
    this.delegate('save', [...arguments], context2DMethodType.FUNCTION);
  }

  restore(): void {
    this.delegate('restore', [...arguments], context2DMethodType.FUNCTION);
  }

  // canvas property is readonly. We don't want to implement getters, but this must be here
  // in order for TypeScript to not complain (for now)
  get canvas(): ElementType {
    return this.canvasElement;
  }

  /* FILTERS */
  /* experimental */ set filter(value: string) {
    this.delegate('filter', [...arguments], context2DMethodType.SETTER);
  }

  /* experimental */ get filter(): string {
    return this.delegate('filter', [...arguments], context2DMethodType.GETTER);
  }
}
