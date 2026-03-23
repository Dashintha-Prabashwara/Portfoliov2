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

      const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      }

      const startDate = formatDate(startDateRaw)
      const endDate = endDateRaw ? formatDate(endDateRaw) : 'Present'

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

export async function getProjects() {
  try {
    const databaseId = process.env.NOTION_PROJECTS_DB
    const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&q=80'

    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: 'Order',
          direction: 'ascending',
        },
      ],
    })

    return response.results.map((result, index) => {
      const properties = result.properties

      const title = properties['Title']?.title?.[0]?.plain_text || ''
      const status = properties['Status']?.select?.name || null
      const description = properties['Description']?.rich_text?.[0]?.plain_text || ''
      const technologies = properties['Technologies']?.multi_select?.map((tech) => tech.name) || []
      const image = properties['Image']?.url || PLACEHOLDER_IMAGE
      const githubUrl = properties['GitHub URL']?.url || ''
      const liveUrl = properties['Live URL']?.url || ''

      // Calculate statusColor based on status value
      const statusColorMap = {
        Production: 'tertiary',
        Active: 'primary',
      }
      const statusColor = status ? statusColorMap[status] || null : null

      // Calculate barColor cycling through colors
      const barColors = ['from-primary to-primary', 'from-secondary to-secondary', 'from-tertiary to-tertiary']
      const barColor = barColors[index % 3]

      return {
        id: result.id,
        title,
        status,
        statusColor,
        barColor,
        description,
        technologies,
        image,
        githubUrl,
        liveUrl,
      }
    })
  } catch (error) {
    console.error('Error fetching projects from Notion:', error)
    return []
  }
}