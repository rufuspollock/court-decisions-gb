Database of judicial decisions -- aka judgments - made in the various crown
courts of England and Wales. It includes judgements of all divisions of the High
Court, the Court of Appeal and the Supreme Court (previously the House of
Lords).

## Data

The data comes from the BAILII website. BAILII is British and Irish Legal
Information Institute:

<http://www.bailii.org/>

BAILII publish UK judicial decisions under contract with Her Majesty's
Court Service (HMCS). [source][foi1]

[foi1]: https://www.whatdotheyknow.com/request/information_provided_to_bailii_f#incoming-189463

Data structure is best described in the `datapackage.json`.

Courts covered:

```
[ 'EWCA/Civ', 'England and Wales', 'Court of Appeal', 'Civil Division' ],
[ 'EWCA/Crim', 'England and Wales', 'Court of Appeal', 'Criminal Division' ],
[ 'EWHC/Admin', 'England and Wales', 'High Court', 'Administrative Court' ],
[ 'EWHC/Admlty', 'England and Wales', 'High Court', 'Admiralty Division' ],
[ 'EWHC/Ch', 'England and Wales', 'High Court', 'Chancery Division' ],
[ 'EWHC/Comm', 'England and Wales', 'High Court', 'Commercial Court' ],
[ 'EWHC/Costs', 'England and Wales', 'High Court', 'Senior Court Costs Office' ],
[ 'EWHC/Exch', 'England and Wales', 'High Court', 'Exchequer Court' ],
[ 'EWHC/KB', 'England and Wales', 'High Court', 'King\'s Bench Division' ],
[ 'EWHC/Mercantile', 'England and Wales', 'High Court', 'Mercantile Court' ],
[ 'EWHC/Patents', 'England and Wales', 'High Court', 'Patents Court' ],
[ 'EWHC/QB', 'England and Wales', 'High Court', 'Queen\'s Bench Division' ],
[ 'EWHC/TCC', 'England and Wales', 'High Court', 'Technology and Construction Court' ],
[ 'EWPCC', 'England and Wales', 'Patents County Court', '' ]
```

We currently exclude the following courts to reduce issues with personal
identification:

* England and Wales Magistrates' Court (Family)
* England and Wales County Court (Family)

## License

Surprisingly, the exact legal status of judicial decisions is unclear. In
response to an [FoI by Lucy Series in 2011][foi], Her Majesty's Court Service
(HMCS) stated:

[foi]: https://thesmallplaces.wordpress.com/2011/05/16/whose-copyright-is-it-anyway/

> The position regarding copyright in court judgments is not, however, entirely
> clear. The Office of Public Sector Information (OPSI), is part of the
> National Archives and manage all copyrights owned by the Crown on Her
> Majesty's behalf.  Copyright material which is produced by employees of the
> Crown in the course of their duties and therefore most material originated by
> ministers and civil servants is protected by Crown copyright. There is no
> definitive view on whether court judgments are Crown copyright. Although
> OPSI, following advice from the Treasury Solicitor, take the view that
> copyright in court judgments rests with the Crown, in that judges are
> officers or servants of the Crown and their judgments are delivered in the
> course of their duties, this is not a universally held view and it can be
> argued that judges act independently of the Crown and that copyright in court
> judgments rest with individual judges. OPSI's position is that insofar as
> judgments are Crown copyright it is content for them to be re-used free of
> charge and without requiring prior clearance providing the source is
> acknowledged.
> 
> Consideration would need to be given to the rights of reporters and
> journalists as published editions of judgments attract copyright protection
> in the typographical arrangement of their published editions although not in
> the judgment itself. Reporters may also seek copyright protection for
> additional content such as head notes and other commentary.  

Based on this, it would be safe to assume judgements, including those published
on the BAILII website, are Crown Copyright and may be used and re-used free of
charge - probably, nowadays, under the UK Government's [open][] Open Government
License.

Thus, we take the position that the text of these judgments is Crown Copyright,
licensed under the OGL. Meanwhile the database we have created, to the extent
that rights exist in it, is licensed under the Open Data Commons Public Domain
Dedication and License.

[open]: http://opendefinition.org/

## Running the Scraper

The scraper is written in nodejs so install that first. Then install required
packages:

    npm install .

Then run it:

    node scripts/scrape.js

## TODO

Scrape of full text planned but not yet implemented.

## Credits

I have had a long-standing interest in this project. The UK is a major global
centre for commercial litigation - with many standard contracts having UK
juristiction clauses. This means that UK commercial court decisions are an
incredibly rich source of information, especially on corporations.

I was therefore delighted when http://judgmental.org.uk/ was started by Francis
Irving, James Cranch and Nick Bull in 2011. Unfortunately in 2013 it shut down
over legal action. Soon after, I started this repo focusing more on scraping
the data from scratch.

