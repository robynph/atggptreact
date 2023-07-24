const API_ENDPOINTS = {
    collections: `${process.env.REACT_APP_API_URL}/collections` || 'https://atgdemoapi.canurta.bio/collections',
    collectionsIngest: `${process.env.REACT_APP_API_URL}/collections/ingest` || 'https://atgdemoapi.canurta.bio/collections/ingest',
    collectionsUpload: `${process.env.REACT_APP_API_URL}/collections/upload` || 'https://atgdemoapi.canurta.bio/collections/upload',
    conversations: `${process.env.REACT_APP_API_URL}/conversations` || 'https://atgdemoapi.canurta.bio/conversations',
    templates: `${process.env.REACT_APP_API_URL}/templates` || 'https://atgdemoapi.canurta.bio/templates', 
    templatesUpload: `${process.env.REACT_APP_API_URL}/templates/upload` || 'https://atgdemoapi.canurta.bio/templates/upload',
    templatesDetails: `${process.env.REACT_APP_API_URL}/templates/details` || 'https://atgdemoapi.canurta.bio/templates/details', 
    interactions: `${process.env.REACT_APP_API_URL}/interactions` || 'https://atgdemoapi.canurta.bio/interactions', 
    login: `${process.env.REACT_APP_API_URL}/login` || 'https://atgdemoapi.canurta.bio/login',
    reports: `${process.env.REACT_APP_API_URL}/reports` || 'https://atgdemoapi.canurta.bio/reports',
  };
  
  export default API_ENDPOINTS;
  