const { Client } = require('@notionhq/client')

const notion = new Client({
  auth: process.env.NOTION_SECRET,
})

console.log('Notion databases keys:', Object.keys(notion.databases))
console.log('Notion type:', notion.constructor.name)

export async function getExperience() {
  try {
    const databaseId = process.env.NOTION_EXPERIENCE_DB

    console.log('Notion Secret exists:', !!process.env.NOTION_SECRET)
    console.log('Database ID exists:', !!process.env.NOTION_EXPERIENCE_DB)
    console.log('Notion client:', typeof notion.databases)

    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: 'Start Date',
          direction: 'descending',
        },
      ],
    })

    return response.results.map((result, index) => {
      const properties = result.properties

      const company = properties['Company']?.title?.[0]?.plain_text || ''
      const role = properties['Role']?.rich_text?.[0]?.plain_text || ''

      const startDateRaw = properties['Start Date']?.date?.start
      const endDateRaw = properties['End Date']?.date?.start

      const startDate = startDateRaw
        ? new Date(startDateRaw).getFullYear().toString()
        : ''
      const endDate = endDateRaw
        ? new Date(endDateRaw).getFullYear().toString()
        : 'Present'

      const description =
        properties['Description']?.rich_text?.[0]?.plain_text || ''

      const tags =
        properties['Tags']?.multi_select?.map((tag) => tag.name) || []

      const colors = ['primary', 'secondary', 'tertiary']
      const color = colors[index % colors.length]

      return {
        id: result.id,
        company,
        role,
        startDate,
        endDate,
        description,
        tags,
        color,
        align: index % 2 === 0 ? 'left' : 'right',
        period: `${startDate} — ${endDate}`,
      }
    })
  } catch (error) {
    console.error('Error fetching experience from Notion:', error)
    return []
  }
}