import pymysql

json_data = {}
results = []
db = pymysql.connect(
    "123.206.81.19",
    "root",
    "oracle",
    "test"
)
cursor = db.cursor()
sql = "select count from django_highcharts where location='tokyo' order by `datetime`"
cursor.execute(sql)
for i in cursor.fetchall():
    results.append(i[0])
print(results)

json_data['tokyo_data'] = results
print(json_data)