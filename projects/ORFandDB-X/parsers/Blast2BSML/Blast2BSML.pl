#!/usr/bin/perl -W

use strict;
use Bio::SearchIO;

if(scalar(@ARGV)!=2) {
	die "This program needs two parameters: an input Blast result file, and the output file prefix, where results are going to be saved in BSML XML";
}

# TODO: error recovery. BioPerl classes already do error checking.
my $in = new Bio::SearchIO(
		-format	=>	'blast',
		-file	=>	$ARGV[0]
		);

my($counter)=0;
while( my $r = $in->next_result ) {
	my $out = new Bio::SearchIO(
			-output_format	=>	'BSMLResultWriter',
			-file		=>	'>'.$ARGV[1]."_${counter}.xml"
			);

	$out->write_result($r);
	$out->close();
	$counter++;
}


$in->close();

#while( my $result = $in->next_result ) {
#	# this is a Bio::Search::Result::HMMERResult object
#	print $result->query_name(), " for HMM ", $result->hmm_name(), "\n";
#	while( my $hit = $result->next_hit ) {
#		print $hit->name(), "\n";
#		while( my $hsp = $hit->next_hsp ) {
#			print "length is ", $hsp->length(), "\n";
#		}
#	}
#}
