# pip install chromadb

import chromadb
client = chromadb.HttpClient(
  ssl=True,
  host='api.trychroma.com',
  tenant='99476425-2921-44b0-8b81-48be9f979971',
  database='solvd',
  headers={
      'x-chroma-token': 'ck-FFxsViM12xVqCjdYCbJdDjsp8f5fDmNwEkjab8koEC7T'
  }
)

collection = client.get_or_create_collection('fruit')
#collection.add(
 # ids=['1', '2', '3'],
 # documents=['apple', 'oranges', 'pineapple']#
#)
print(collection.query(query_texts='', n_results=1))
  