export interface ReportTemplate {
  name: string
  content: string
}

export const reportTemplates: ReportTemplate[] = [
  {
    name: '日报模板',
    content: `## 今日完成
-

## 进行中
-

## 明日计划
-`,
  },
  {
    name: '站会模板',
    content: `## 昨天完成
-

## 今天计划
-

## 遇到的问题
-`,
  },
  {
    name: '空白模板',
    content: '',
  },
]
