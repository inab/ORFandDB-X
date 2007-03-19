#!/usr/local/bin/perl -w

use strict;

my($defsource)='Blast';

if(scalar(@ARGV)==5 || scalar(@ARGV)==8) {
	my($tag,$infile,$outfile,$indb,$outdb,$inpat,$outpat,$searchpat);
	
	($tag,$infile,$outfile,$indb,$outdb)=@ARGV[0..4];
	$inpat='[^(]*\(([^)]+)\).*';
	$outpat='[^(]*\(([^)]+)\).*';
	$searchpat='[^(]*\(([^)]+)\).*';
	if(scalar(@ARGV)==8) {
		$inpat=$ARGV[5]  if(length($ARGV[5])>0);
		$outpat=$ARGV[6]  if(length($ARGV[6])>0);
		$searchpat=$ARGV[7]  if(length($ARGV[7])>0);
	}
	
	local(*INFILE);
	
	if(open(INFILE,'<'.$infile)) {
		local(*OUTXML);
		my($err)=undef;
		
		if(open(OUTXML,'>'.$outfile)) {
			print OUTXML <<XML;
<?xml version='1.0' encoding='ISO-8859-1'?>

<$tag namespace="http://www.pdg.cnb.uam.es/jmfernandez/ORFandDB/3/$tag">
XML
			
			my($searchacc);
			my($inacc);
			my($outacc);
			my($qseq,$hseq,$midline);
			my($fromin,$toin);
			my($fromout,$toout);
			my($evalue);
			my($line);
			while($line=<INFILE>) {
				# Beginning...
				if($line =~ /<\?xml/) {
					next;
				}
				
				# Real begin
				if($line =~ /<BlastOutput_query-def>(.+)<\/BlastOutput_query-def>/) {
					my($querydef)=$1;
					if($querydef =~ /$inpat/) {
						$inacc=$1;
					} else {
						$inacc=$querydef;
					}
					if($querydef =~ /$searchpat/) {
						$searchacc=$1;
					} else {
						$searchacc=$querydef;
					}
					print OUTXML<<ENDBL;
	<AlignRes>
		<ProgramRes>
			<Result>
				<BioEntry AccNumber='$searchacc' DbName='$defsource' />
			</Result>
		</ProgramRes>
	</AlignRes>
	<AlignQueryRes AccNumber_S='$inacc' DbName_S='$indb' AccNumber_AR='$searchacc' DbName_AR='$defsource' />
ENDBL

					next;
				}
				
				if($line =~ /<Hit_def>$outpat<\/Hit_def>/) {
					$outacc=$1;
					next;
				}
				
				# E-Value
				if($line =~ /<Hsp_evalue>(.+)<\/Hsp_evalue>/) {
					$evalue=$1;
					next;
				}
				
				# From..To
				if($line =~ /<Hsp_query-from>(.+)<\/Hsp_query-from>/) {
					$fromin=$1;
					next;
				}
				
				if($line =~ /<Hsp_query-to>(.+)<\/Hsp_query-to>/) {
					$toin=$1;
					next;
				}
				
				if($line =~ /<Hsp_hit-from>(.+)<\/Hsp_hit-from>/) {
					$fromout=$1;
					next;
				}
				
				if($line =~ /<Hsp_hit-to>(.+)<\/Hsp_hit-to>/) {
					$toout=$1;
					next;
				}
				
				# Lines
				if($line =~ /<Hsp_qseq>(.+)<\/Hsp_qseq>/) {
					$qseq=$1;
					next;
				}
				
				if($line =~ /<Hsp_hseq>(.+)<\/Hsp_hseq>/) {
					$hseq=$1;
					next;
				}
				
				if($line =~ /<Hsp_midline>(.+)<\/Hsp_midline>/) {
					$midline=$1;
					next;
				}
				
				if($line =~ /<\/Hsp>/) {
					# Here we must write the results
					print OUTXML<<ENDALIGN;
	<AlignLineRes
		AccNumber_S='$outacc'
		DbName_S='$outdb'
		AccNumber_AR='$searchacc'
		DbName_AR='$defsource'
		EValue='$evalue'
		QueryLine='$qseq'
		Midline='$midline'
		TargetLine='$hseq'
		IniSeq='$fromin'
		EndSeq='$toin'
		IniBio='$fromout'
		EndBio='$toout'
	/>
ENDALIGN

				}
			}
			
			print OUTXML "</$tag>\n";
			close(OUTXML);
			
		} else {
			warn "ERROR: I could no create file $outfile!!!\n";
		}
		
		close(INFILE);
		exit 1  if(defined($err));
	} else {
		die "ERROR: I could open file $infile for reading!!!\n";
	}
} else {
	die "$0: This program takes 3 parameters: a tag, an input file, an output file, input database\n";
}
