const API_ENDPOINTS = {
    collections: `${process.env.REACT_APP_API_URL}/collections` || 'http://atgdemoapi.canurta.bio/collections',
    collectionsIngest: `${process.env.REACT_APP_API_URL}/collections/ingest` || 'http://atgdemoapi.canurta.bio/collections/ingest',
    collectionsUpload: `${process.env.REACT_APP_API_URL}/collections/upload` || 'http://atgdemoapi.canurta.bio/collections/upload',
    conversations: `${process.env.REACT_APP_API_URL}/conversations` || 'http://atgdemoapi.canurta.bio/conversations',
    templates: `${process.env.REACT_APP_API_URL}/templates` || 'http://atgdemoapi.canurta.bio/templates', 
    templatesUpload: `${process.env.REACT_APP_API_URL}/templates/upload` || 'http://atgdemoapi.canurta.bio/templates/upload',
    templatesDetails: `${process.env.REACT_APP_API_URL}/templates/details` || 'http://atgdemoapi.canurta.bio/templates/details', 
    interactions: `${process.env.REACT_APP_API_URL}/interactions` || 'http://atgdemoapi.canurta.bio/interactions', 
    login: `${process.env.REACT_APP_API_URL}/login` || 'http://atgdemoapi.canurta.bio/login',
    reports: `${process.env.REACT_APP_API_URL}/reports` || 'http://atgdemoapi.canurta.bio/reports',
  };
  
  export default API_ENDPOINTS;
  