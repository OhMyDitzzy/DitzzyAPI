import axios from "axios";
import * as cheerio from "cheerio";

export function getSlugFromUrl(url) {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || '';
  } catch (error) {
    try {
      const parts = url.split("/").filter(Boolean);
      return parts[parts.length - 1] || '';
    } catch {
      return '';
    }
  }
}

function parseUpdateToMs(updateText) {
  const now = Date.now();
  
  const match = updateText.match(/(\d+)\s*(detik|menit|jam|hari|minggu|bulan|tahun)/i);
  
  if (!match) return 0;
  
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  
  const msPerUnit = {
    'detik': 1000,
    'menit': 60 * 1000,
    'jam': 60 * 60 * 1000,
    'hari': 24 * 60 * 60 * 1000,
    'minggu': 7 * 24 * 60 * 60 * 1000,
    'bulan': 30 * 24 * 60 * 60 * 1000,
    'tahun': 365 * 24 * 60 * 60 * 1000
  };
  
  const ms = msPerUnit[unit] || 0;
  return now - (value * ms);
}

function resizeThumbnail(url, width = 540, height = 350) {
  if (!url) return url;

  if (url.includes('?resize=')) {
    return url.replace(/\?resize=\d+,\d+/, `?resize=${width},${height}`);
  }
  
  return url;
}

export class Komiku {
  constructor() {
    this.BASE_URL = "https://komiku.org";
    this.API_URL = "https://api.komiku.org";
    this.CREATED_BY = "Ditzzy";
    this.NOTE = "Thank you for using this scrape, I hope you appreciate me for making this scrape by not deleting wm";
  }
  
  wrapResponse(data) {
    return {
      created_by: this.CREATED_BY,
      note: this.NOTE,
      results: data
    };
  }

  async search(query, postType = "manga") {
    try {
      const { data } = await axios.get(`${this.API_URL}/?post_type=${postType}&s=${encodeURIComponent(query)}`);
      const $ = cheerio.load(data);

      const results = [];
      const $containers = $('div.bge');

      for (let index = 0; index < $containers.length; index++) {
        const el = $containers[index];
        
        try {
          let thumbnailUrl = '';
          const imgElement = $(el).find('img').first();
          if (imgElement.length > 0) {
            thumbnailUrl = imgElement.attr('src') || imgElement.attr('data-src') || '';
            thumbnailUrl = resizeThumbnail(thumbnailUrl);
          }

          let type = '';
          let genre = '';
          const typeGenreElement = $(el).find('div.tpe1_inf, .tpe1_inf');
          if (typeGenreElement.length > 0) {
            const text = typeGenreElement.text().trim();
            const parts = text.split(/\s+/);
            if (parts.length > 0) {
              type = parts[0].replace(/<\/?b>/g, '').trim();
              genre = parts.slice(1).join(' ').trim();
            }
          }

          let title = '';
          let mangaUrl = '';
          
          const h3Element = $(el).find('h3').first();
          if (h3Element.length > 0) {
            title = h3Element.text().trim();
            
            const parentLink = h3Element.parent('a');
            if (parentLink.length > 0) {
              mangaUrl = parentLink.attr('href') || '';
            } else {
              const nearbyLink = h3Element.closest('div').find('a[href*="/manga/"]').first();
              if (nearbyLink.length > 0) {
                mangaUrl = nearbyLink.attr('href') || '';
              }
            }
          }

          if (!title || !mangaUrl) {
            $(el).find('a[href*="/manga/"]').each((_, linkEl) => {
              const h3 = $(linkEl).find('h3');
              if (h3.length > 0) {
                title = h3.text().trim();
                mangaUrl = $(linkEl).attr('href') || '';
                return false;
              }
            });
          }

          if (mangaUrl && !mangaUrl.startsWith('http')) {
            mangaUrl = this.BASE_URL + mangaUrl;
          }

          let lastUpdateMs = 0;
          $(el).find('p').each((_, pEl) => {
            const text = $(pEl).text().trim();
            if (text.toLowerCase().includes('update')) {
              lastUpdateMs = parseUpdateToMs(text);
              return false;
            }
          });

          let firstChapter = null;
          let latestChapter = null;

          $(el).find('div.new1, .new1').each((_, newEl) => {
            const link = $(newEl).find('a');
            if (link.length > 0) {
              const spans = link.find('span');
              
              if (spans.length >= 2) {
                const label = spans.first().text().trim().toLowerCase();
                const chapterTitle = spans.last().text().trim();
                const chapterUrl = link.attr('href') || '';
                
                const fullUrl = chapterUrl && !chapterUrl.startsWith('http') 
                  ? this.BASE_URL + chapterUrl 
                  : chapterUrl;
                
                const chapterSlug = getSlugFromUrl(chapterUrl);

                if (label.includes('awal') || label.includes('first')) {
                  firstChapter = {
                    title: chapterTitle,
                    url: fullUrl,
                    slug: chapterSlug
                  };
                } else if (label.includes('terbaru') || label.includes('latest')) {
                  latestChapter = {
                    title: chapterTitle,
                    url: fullUrl,
                    slug: chapterSlug
                  };
                }
              }
            }
          });

          if (title && mangaUrl) {
            const slug = getSlugFromUrl(mangaUrl);
            const detail = await this.getDetail(slug);
            
            results.push({
              title,
              mangaUrl,
              thumbnailUrl,
              type,
              genre,
              lastUpdateMs,
              firstChapter,
              latestChapter,
              detail          
            });
          }
        } catch (error) {
          console.error('Error parsing search item:', error);
        }
      }

      return this.wrapResponse(results);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error on search:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText
        });
      } else {
        console.error('Error on search:', error);
      }
      return [];
    }
  }

  async getDetail(slug) {
    try {
      const { data } = await axios.get(`${this.BASE_URL}/manga/${slug}`);
      const $ = cheerio.load(data);
      let results = null;

      $('.series').each((_, el) => {
        const keyMap = {
          'Judul Komik': 'title',
          'Judul Indonesia': 'indonesia_title',
          'Jenis Komik': 'type',
          'Pengarang': 'author',
          'Status': 'status'
        };

        const info = {};

        $(el).find('table.inftable tr').each((_, el) => {
          const key = $(el).find('td:first-child').text().trim();
          const value = $(el).find('td:last-child').text().trim();

          if (keyMap[key]) {
            info[keyMap[key]] = value;
          }
        });

        const genre = [];
        $('ul.genre li.genre span[itemprop="genre"]').each((_, el) => {
          genre.push($(el).text().trim());
        });

        const synopsis = $('p.desc').text().trim();
        let thumbnailUrl = $('div.ims img[itemprop="image"]').attr("src")?.trim() || '';
        thumbnailUrl = resizeThumbnail(thumbnailUrl);

        const chapters = [];
        $('table#Daftar_Chapter tr:not(:first-child)').each((_, el) => {
          const chapter = $(el).find('td.judulseries a span').text().trim();
          const slug_chapter = $(el).find('td.judulseries a').attr('href')?.replace(/\//g, '') || '';
          const views = $(el).find('td.pembaca i').text().trim();
          const date = $(el).find('td.tanggalseries').text().trim();

          chapters.push({ chapter, slug_chapter, views, date });
        });

        results = {
          ...info,
          thumbnailUrl,
          synopsis,
          genre,
          chapters    
        };
      });

      return this.wrapResponse(results);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error fetching detail:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText
        });
      } else {
        console.error('Error fetching detail:', error);
      }
      return this.wrapResponse(null);
    }
  }

  async readChapter(chapterSlug) {
    try {
      const { data } = await axios.get(`${this.BASE_URL}/${chapterSlug}/`);      
      const $ = cheerio.load(data);
      const title = $('#Judul h1').text().trim();
      const images = [];
      
      $('#Baca_Komik img').each((_, el) => {
        const imageUrl = $(el).attr('src') || '';
        const index = parseInt($(el).attr('id') || '0');
        
        if (imageUrl && index) {
          images.push({
            index,
            imageUrl
          });
        }
      });

      images.sort((a, b) => a.index - b.index);

      const chapterNumber = chapterSlug.match(/chapter-(\d+)/)?.[1] || '';
      const seriesTitle = title.split('Chapter')[0].trim();
      const seriesSlug = chapterSlug.split('-chapter-')[0];
      const seriesUrl = `${this.BASE_URL}/manga/${seriesSlug}`;

      const result = {
        title,
        chapterNumber,
        seriesTitle,
        seriesUrl,
        totalImages: images.length,
        images,
      };

      return this.wrapResponse(result);

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error reading chapter:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText
        });
      } else {
        console.error('Error reading chapter:', error);
      }
      return this.wrapResponse(null);
    }
  }

  async getLatestPopularManga() {
    try {
      const { data } = await axios.get(this.BASE_URL);
      const $ = cheerio.load(data);
      const results = [];

      $(".home #Komik_Hot_Manga article.ls2").each((_, el) => {
        try {
          const title = $(el).find(".ls2j h3 a").text().trim();
          const mangaUrlPath = $(el).find(".ls2j h3 a").attr("href");
          const mangaUrl = mangaUrlPath ? `${this.BASE_URL}${mangaUrlPath}` : '';
          const slug = mangaUrl ? getSlugFromUrl(mangaUrl) : '';

          let thumbnailUrl =
            $(el).find("img").attr("data-src") ||
            $(el).find("img").attr("src") ||
            '';
          thumbnailUrl = resizeThumbnail(thumbnailUrl);

          const genreView = $(el).find(".ls2t").text().trim();
          const latestChapter = $(el).find(".ls2l").text().trim();
          const chapterUrlPath = $(el).find(".ls2l").attr("href");
          const chapterUrl = chapterUrlPath ? `${this.BASE_URL}${chapterUrlPath}` : '';

          if (title && mangaUrl) {
            results.push({
              title,
              mangaUrl,
              thumbnailUrl,
              genreView,
              slug,
              latestChapter,
              chapterUrl              
            });
          }
        } catch (error) {
          console.error('Error parsing manga item:', error);
        }
      });

      return this.wrapResponse(results);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error fetching latest manga:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText
        });
      } else {
        console.error('Error fetching latest manga:', error);
      }
      return [];
    }
  }
  
  async getLatestPopularManhwa() {
    try {
      const { data } = await axios.get(this.BASE_URL);
      const $ = cheerio.load(data);
      const results = [];

      $(".home #Komik_Hot_Manhwa article.ls2").each((_, el) => {
        try {
          const title = $(el).find(".ls2j h3 a").text().trim();
          const mangaUrlPath = $(el).find(".ls2j h3 a").attr("href");
          const mangaUrl = mangaUrlPath ? `${this.BASE_URL}${mangaUrlPath}` : '';
          const slug = mangaUrl ? getSlugFromUrl(mangaUrl) : '';

          let thumbnailUrl =
            $(el).find("img").attr("data-src") ||
            $(el).find("img").attr("src") ||
            '';
          thumbnailUrl = resizeThumbnail(thumbnailUrl);

          const genreView = $(el).find(".ls2t").text().trim();
          const latestChapter = $(el).find(".ls2l").text().trim();
          const chapterUrlPath = $(el).find(".ls2l").attr("href");
          const chapterUrl = chapterUrlPath ? `${this.BASE_URL}${chapterUrlPath}` : '';

          if (title && mangaUrl) {
            results.push({
              title,
              mangaUrl,
              thumbnailUrl,
              genreView,
              slug,
              latestChapter,
              chapterUrl              
            });
          }
        } catch (error) {
          console.error('Error parsing manga item:', error);
        }
      });

      return this.wrapResponse(results);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error fetching latest manga:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText
        });
      } else {
        console.error('Error fetching latest manga:', error);
      }
      return [];
    }
  }
  
  async getLatestPopularManhua() {
    try {
      const { data } = await axios.get(this.BASE_URL);
      const $ = cheerio.load(data);
      const results = [];

      $(".home #Komik_Hot_Manhua article.ls2").each((_, el) => {
        try {
          const title = $(el).find(".ls2j h3 a").text().trim();
          const mangaUrlPath = $(el).find(".ls2j h3 a").attr("href");
          const mangaUrl = mangaUrlPath ? `${this.BASE_URL}${mangaUrlPath}` : '';
          const slug = mangaUrl ? getSlugFromUrl(mangaUrl) : '';

          let thumbnailUrl =
            $(el).find("img").attr("data-src") ||
            $(el).find("img").attr("src") ||
            '';
          thumbnailUrl = resizeThumbnail(thumbnailUrl);

          const genreView = $(el).find(".ls2t").text().trim();
          const latestChapter = $(el).find(".ls2l").text().trim();
          const chapterUrlPath = $(el).find(".ls2l").attr("href");
          const chapterUrl = chapterUrlPath ? `${this.BASE_URL}${chapterUrlPath}` : '';

          if (title && mangaUrl) {           
            results.push({
              title,
              mangaUrl,
              thumbnailUrl,
              genreView,
              slug,
              latestChapter,
              chapterUrl            
            });
          }
        } catch (error) {
          console.error('Error parsing manga item:', error);
        }
      });

      return this.wrapResponse(results);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error fetching latest manga:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText
        });
      } else {
        console.error('Error fetching latest manga:', error);
      }
      return [];
    }
  }
}