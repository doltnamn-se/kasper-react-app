
import { supabase } from "@/integrations/supabase/client";

export const removeSpecificUrls = async () => {
  const urlsToDelete = [
    'https://www.google.se/search?q=pia+ekstr%C3%B6m+danske+bank&client=safari&sca_esv=36e211bf01c2d063&channel=iphone_bm&ei=3Q7MZ56XFo69wPAP6vmDqAo&oq=pia+ekstr%C3%B6m+danske&gs_lp=EhNtb2JpbGUtZ3dzLXdpei1zZXJwIhNwaWEgZWtzdHLDtm0gZGFuc2tlKgIIADIFECEYoAEyBRAhGKABMggQABiABBiiBDIIEAAYogQYiQUyBRAAGO8FMgUQABjvBTIFEAAY7wVI4lNQnQ5Y8EJwAXgAkAECmAFloAGLCqoBBDE5LjG4AQHIAQD4AQGYAhOgAo0KwgIIEAAYsAMY7wXCAgsQABiABBiwAxiiBMICBxAhGKABGArCAgQQIRgVwgIFECEYnwXCAgUQABiABMICBhAAGBYYHpgDAIgGAZAGBZIHBDE4LjGgB-Nj&sclient=mobile-gws-wiz-serp',
    'https://www.google.se/search?q=pia+ekstr%C3%B6m+norrk%C3%B6ping&client=safari&sca_esv=36e211bf01c2d063&channel=iphone_bm&source=hp&ei=0A7MZ_GXMoXQwPAPhr6RmA0&oq=pia+Ekstr%C3%B6m+norr&gs_lp=EhFtb2JpbGUtZ3dzLXdpei1ocCIRcGlhIEVrc3Ryw7ZtIG5vcnIqAggAMgUQIRigATIFECEYoAEyBRAhGKABMggQABiABBiiBDIIEAAYgAQYogQyBRAAGO8FMggQABiiBBiJBTIIEAAYgAQYogRIrkJQvgtY8jtwA3gAkAEAmAFfoAHzB6oBAjE2uAEByAEA-AEBmAIToALuCKgCD8ICChAAGAMY6gIYjwHCAgoQLhgDGOoCGI8BwgILEAAYgAQYsQMYgwHCAg4QLhiABBixAxjRAxjHAcICDhAuGIAEGLEDGIMBGIoFwgIIEAAYgAQYsQPCAggQLhiABBixA8ICBRAAGIAEwgIOEC4YgAQYsQMYgwEY1ALCAgsQLhiABBjHARivAcICBRAuGIAEwgIGEAAYFhgemAMQ8QXM8orNhVNLApIHBDE4LjGgB71i&sclient=mobile-gws-wiz-hp'
  ];

  console.log('Attempting to delete specific URLs');
  
  const { error } = await supabase
    .from('removal_urls')
    .delete()
    .in('url', urlsToDelete);

  if (error) {
    console.error('Error deleting URLs:', error);
    throw error;
  }

  console.log('Successfully deleted specified URLs');
  return true;
};
