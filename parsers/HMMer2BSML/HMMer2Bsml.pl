#!/usr/bin/perl -W

use strict;
use Bio::SearchIO;

if(scalar(@ARGV)!=2) {
	die "This program needs two parameters: an input HMMer result file, and the output file where result is going to be saved in Bsml XML";
}

# TODO: error recovery. BioPerl classes already do error checking.
my $in = new Bio::SearchIO(
		-format	=>	'hmmer',
		-file	=>	$ARGV[0]
		);
	
my $out = new Bio::SearchIO(
		-output_format	=>	'BSMLResultWriter',
		-file		=>	'>'.$ARGV[1]
		);

while( my $r = $in->next_result ) {
	$out->write_result($r);
}

$out->close();

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