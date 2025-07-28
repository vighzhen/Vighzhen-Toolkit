declare module 'pdfjs-dist' {
  export const GlobalWorkerOptions: {
    workerSrc: string
  }

  export function getDocument(src: any): {
    promise: Promise<PDFDocumentProxy>
  }

  export interface PDFDocumentProxy {
    numPages: number
    getPage(pageNumber: number): Promise<PDFPageProxy>
  }

  export interface PDFPageProxy {
    getTextContent(): Promise<TextContent>
    getViewport(params: { scale: number }): PageViewport
    render(params: RenderParameters): RenderTask
  }

  export interface TextContent {
    items: TextItem[]
  }

  export interface TextItem {
    str: string
    transform: number[]
  }

  export interface PageViewport {
    width: number
    height: number
  }

  export interface RenderParameters {
    canvasContext: CanvasRenderingContext2D
    viewport: PageViewport
  }

  export interface RenderTask {
    promise: Promise<void>
  }
} 