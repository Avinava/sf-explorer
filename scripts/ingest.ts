import fs from "fs-extra";
import axios from "axios";
import {JSDOM} from 'jsdom';


const LANG = "en-us";
const DOCS_BASE_URL = "https://developer.salesforce.com/docs";
const META_URL = `${DOCS_BASE_URL}/get_document/atlas.en-us.sfdx_cli_reference.meta`;
const CONTENT_BASE_URL = `${DOCS_BASE_URL}/get_document_content`;
const RAW_CONTENT_PATH = `data/raw/content`;
const PROCESSED_CONTENT_PATH = `data/processed/content`;

class Ingest {
  private uniquePaths = new Set();
  public static async main() {
    const ingest = new Ingest();
    await ingest.ensureFolders();
    const response = await ingest.getMetaFile();
    await ingest.getContent(response.toc[0].children, response.deliverable, response.version.doc_version);
    const files = await fs.readdir(RAW_CONTENT_PATH);
    await fs.ensureDir(PROCESSED_CONTENT_PATH);
    await fs.emptyDir(PROCESSED_CONTENT_PATH);
    for(const file of files){
      const topics = await Ingest.process(`${RAW_CONTENT_PATH}/${file}`);
      
      for(const topic of topics){
        const filePath = `${PROCESSED_CONTENT_PATH}/${file}`;
        const name = topic.title?.replace(/ /g, '_');
        // insert the name before .htm.json
        const fileName = filePath.replace(/\.htm\.json/, `_${name}.json`);
        await fs.writeJSON(`${fileName}`, topic);
      }
    }
    
  }

  public static async process(path = 'data/raw/content/cli_reference_alias_set.htm.json') {
    // read the json file
    const data = await fs.readJson(path);
    // remove double quotes escaping from data.content
     data.content = data.content.replace(/"/g, '"');
    // replace new lines with br
     data.content = data.content.replace(/\n/g, '<br>');

    // parse the html
    const dom = new JSDOM(data.content);
    const document = dom.window.document;
    const topics: any[] = [];
    document.querySelectorAll(".topic").forEach((topic) => {
      const sections = Array.from(topic.querySelectorAll(".section"));
      const topicData = {
        title: topic.querySelector(".titlecodeph")?.textContent,
        shortDescription: topic.querySelector("#shortdesc")?.textContent,
        details: {},
        warning: {
          text: '',
          html: '',
        },
        help: {
          text: '',
          html: '',
        },
        contents: [],
        sections: sections.length
      }
      
        const warn = topic.querySelector(".warn");
        topicData.warning.text = warn?.textContent || '';
        topicData.warning.html = warn?.innerHTML || '';
        
        const helpSections = sections.filter((section) => {
          if(section.querySelector('.helpHead3')?.textContent){
            return true;
          }
        })
       // declare array of string
        const text: string[] = [];
        const html: string[] = [];
        helpSections.forEach((section) => {
          text.push(section?.textContent as string);
          html.push(section?.innerHTML as string);
        })

        topicData.help.text = text.join('\n');
        topicData.help.html = html.join('');
        // remove additionally spaces between html tags and prettify the html
        topicData.help.html = topicData.help.html.replace(/>\s+</g, '><');
        topics.push(topicData);
    });
    return topics;
  }

  async ensureFolders() {
    await fs.ensureDir("data");
    await fs.ensureDir("data/processed");
    await fs.ensureDir("data/raw");
    fs.ensureDir(RAW_CONTENT_PATH);
    fs.emptyDir(RAW_CONTENT_PATH);
  }

  async getMetaFile() {
    const response = await axios.get(META_URL, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    await fs.writeJSON("data/raw/metadata.json", response.data);
    return response.data;
  }

  // {
  //     "text": "Release Notes",
  //     "a_attr": { "href": "cli_reference_release_notes.htm" },
  //     "id": "cli_reference_release_notes",
  //     "children": [],
  //   }
  async getContent(main: any, deliverable: any, version: any) {
    for (const children of main) {
      if ((children.children || []).length > 0) {
        await this.getContent(children.children, deliverable, version);
      } else if (children.a_attr.href) {
        // split by # and take the first part
        const href = children.a_attr.href.split("#")[0];
        if (!this.uniquePaths.has(href) && href.indexOf("unified") > -1) {
          this.uniquePaths.add(href);
          const contentPath = `${CONTENT_BASE_URL}/${deliverable}/${href}/${LANG}/${version}`;
          const response = await axios.get(contentPath);
          if(response.data.id){
            await fs.writeJson(`${RAW_CONTENT_PATH}/${href}.json`, response.data);
          }
          else {
            // code shouldn't get here
            console.log({
              href,
              contentPath,
            });
          }
        }
      }
    }
  }
}

Ingest.main();
