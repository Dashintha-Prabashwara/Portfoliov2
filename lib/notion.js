import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_SECRET,
})

// Helper function to attempt sorting with error handling
async function queryDatabase(databaseId, filters = {}) {
  try {
    // Try to query with Order property sort
    return await notion.databases.query({
      database_id: databaseId,
      page_size: 100,
      sorts: [
        {
          property: 'Order',
          direction: 'ascending',
        },
      ],
      ...filters,
    })
  } catch {
    // If Order property doesn't exist, query without sorting
    return await notion.databases.query({
      database_id: databaseId,
      page_size: 100,
      ...filters,
    })
  }
}

export async function getExperience() {
  try {
    const databaseId = process.env.NOTION_EXPERIENCE_DB

    const response = await queryDatabase(databaseId)

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
        period: `${startDate} - ${endDate}`,
      }
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching experience from Notion:', error)
    }
    return []
  }
}

export async function getProjects() {
  try {
    const databaseId = process.env.NOTION_PROJECTS_DB
    const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&q=80'

    const response = await queryDatabase(databaseId)

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
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching projects from Notion:', error)
    }
    return []
  }
}

export async function getEducation() {
  try {
    const databaseId = process.env.NOTION_EDUCATION_DB

    const response = await queryDatabase(databaseId)

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Education items fetched:', response.results.length)
      response.results.forEach((item, idx) => {
        const title = item.properties['Title']?.title?.[0]?.plain_text || 'Unknown'
        const order = item.properties['Order']?.number
        console.log(`  [${idx}] ${title} ${order ? `(Order: ${order})` : ''}`)
      })
    }

    return response.results.map((result) => {
      const properties = result.properties

      const title = properties['Title']?.title?.[0]?.plain_text || ''
      const institution = properties['Institution']?.rich_text?.[0]?.plain_text || ''
      const description = properties['Description']?.rich_text?.[0]?.plain_text || ''
      const tags = properties['Tags']?.multi_select?.map((tag) => tag.name) || []

      const startDateRaw = properties['Start Date\t']?.date?.start
      const endDateRaw = properties['End Date\t']?.date?.start

      const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { year: 'numeric' })
      }

      const startDate = formatDate(startDateRaw)
      const endDate = endDateRaw ? formatDate(endDateRaw) : 'PRESENT'

      return {
        id: result.id,
        title,
        institution,
        description,
        tags,
        startDate,
        endDate,
        period: `${startDate} - ${endDate}`,
      }
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching education from Notion:', error)
    }
    return []
  }
}

export async function getCertifications() {
  try {
    const databaseId = process.env.NOTION_CERTIFICATIONS_DB

    const response = await queryDatabase(databaseId)

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Certifications fetched:', response.results.length)
      response.results.forEach((item, idx) => {
        const title = item.properties['Title']?.title?.[0]?.plain_text || 'Unknown'
        const order = item.properties['Order']?.number
        console.log(`  [${idx}] ${title} ${order ? `(Order: ${order})` : ''}`)
      })
    }

    return response.results.map((result) => {
      const properties = result.properties

      const title = properties['Title']?.title?.[0]?.plain_text || ''
      const organization = properties['Organization']?.rich_text?.[0]?.plain_text || ''
      const credentialId = properties['Credential ID\t']?.rich_text?.[0]?.plain_text || ''
      const icon = properties['Icon']?.select?.name || 'verified'
      const status = properties['Status']?.select?.name || null
      const issueDateRaw = properties['Issue Date\t']?.date?.start
      const expiryDateRaw = properties['Expiry Date']?.date?.start
      const verificationUrl = properties['Verification URL\t']?.url || ''

      const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      }

      const issueDate = formatDate(issueDateRaw)
      const expiryDate = formatDate(expiryDateRaw)

      // Calculate statusColor based on status value
      const statusColorMap = {
        'Verified': 'tertiary',
        'Expired': 'error',
        'In Progress': 'warning',
      }
      const statusColor = status ? statusColorMap[status] || null : null

      return {
        id: result.id,
        title,
        organization,
        credentialId,
        icon,
        status,
        statusColor,
        issueDate,
        expiryDate,
        verificationUrl,
      }
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching certifications from Notion:', error)
    }
    return []
  }
}