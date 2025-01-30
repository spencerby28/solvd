import asyncio
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator

async def main():
    md_gen = DefaultMarkdownGenerator(
        options={
            "ignore_links": True,
            "include_tables": True,
            "include_images": False,
            "escape_html": True,
        }
    )
    config = CrawlerRunConfig(
        markdown_generator=md_gen,
        exclude_external_links=True,
    )
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun("https://www.trycoconut.com/", config=config)

        if result.success:
            with open("output.md", "w") as file:
                file.write(result.markdown)
            print("Markdown has been saved to output.md")
        else:
            print("Crawl failed:", result.error_message)

if __name__ == "__main__":
    asyncio.run(main())