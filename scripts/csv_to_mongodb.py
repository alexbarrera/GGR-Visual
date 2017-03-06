import sys
import argparse
from pymongo import MongoClient

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('db', help='Database to connect (name or URL)')
    parser.add_argument('collection', help='Collection to connect (name or URL)')
    parser.add_argument('datafile', default=None, help='Data file to import')
    parser.add_argument('--clienturi', default=None, help='Host to connect')
    parser.add_argument('--delimiter', default="\t", help='Delimiter used in datafile')
    parser.add_argument('--noheaderline', action='store_true', \
                        default=False, help='Header line used in datafile')
    parser.add_argument('--headers', nargs='+', required=False, help='Headers used in datafile')
    parser.add_argument('--dropcollection', action='store_true', help='Drop collection from database before inserting')
    
    
    args = parser.parse_args()
    if args.noheaderline:
        headers = args.headers

    client = MongoClient(args.clienturi)
    db = client[args.db]
    
    if args.dropcollection:
        db[args.collection].drop()
    
    with open(args.datafile) as dataf:
        for nl, l in enumerate(dataf):
            l = l.rstrip()
            if nl==0 and not args.noheaderline:
                headers = l.split(args.delimiter)
                continue
            fields = l.split(args.delimiter)
            for fi, f in enumerate(fields):
                try:
                    fields[fi]=float(f)
                except ValueError:
                    try:
                        fields[fi]=int(f)
                    except ValueError:
                        pass
            db[args.collection].insert_one(dict(zip(headers, fields)))
            
if __name__=='__main__':
    main()
    sys.exit(0)