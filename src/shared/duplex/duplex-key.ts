export enum DuplexMethodTypeEnum {
  request = 'request',
  response = 'response'
}

export interface IDuplexParam {
  header: {
    method: DuplexMethodTypeEnum
  }
  body: {
    code: number
    data: any
    message: string
  }
}

export const DuplexName = 'DuplexName'
